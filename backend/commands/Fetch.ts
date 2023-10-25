import { BaseCommand } from '@adonisjs/core/build/standalone'
import axios from 'axios'
import Vibrant = require('node-vibrant')
import * as fs from 'fs'
const ColorThief = require('colorthief');

const rgbToHex = (v) => '#' + v.map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

function makeColorBrighter(color) {
  // преобразуем строку цвета в массив чисел
  let colorValues = color.substring(1).match(/.{2}/g).map((value) => parseInt(value, 16));
  // увеличиваем значение каждого цвета на 20%
  let brighterColorValues = colorValues.map((value) => Math.round(value * 1.35));
  // ограничиваем значение каждого цвета максимальным значением 255
  brighterColorValues = brighterColorValues.map((value) => value > 255 ? 255 : value);
  // преобразуем массив чисел в строку цвета
  let brighterColorString = "#" + brighterColorValues.map((value) => value.toString(16)).join("");
  return brighterColorString;
}

function avgcolor(colors) {
  let colorsSum = [0, 0, 0];
  for (let i = 0; i < colors.length; i++) {
    let color = colors[i];
    // преобразуем строку цвета в массив чисел
    let colorValues = color.substring(1).match(/.{2}/g).map((value) => parseInt(value, 16));
    // складываем значения цветов в массиве
    colorsSum[0] += colorValues[0];
    colorsSum[1] += colorValues[1];
    colorsSum[2] += colorValues[2];
  }
  // делим сумму каждого цвета на количество цветов в массиве
  let averageColor = colorsSum.map((value) => Math.round(value / colors.length));
  // преобразуем массив чисел в строку цвета
  let averageColorString = "#" + averageColor.map((value) => value.toString(16)).join("");
  return averageColorString;
}

function findBrightestColors(colors) {
  var brightestColors: any[] = [];
  var brightestColor1 = '';
  var brightestColor2 = '';
  var brightestValue1 = 0;
  var brightestValue2 = 0;

  for (var i = 0; i < colors.length; i++) {
    var colorValue = parseInt(colors[i].replace('#', ''), 16);
    if (colorValue > brightestValue1) {
      brightestColor2 = brightestColor1;
      brightestValue2 = brightestValue1;
      brightestColor1 = colors[i];
      brightestValue1 = colorValue;
    } else if (colorValue > brightestValue2) {
      brightestColor2 = colors[i];
      brightestValue2 = colorValue;
    }
  }

  brightestColors.push(brightestColor1);
  brightestColors.push(brightestColor2);

  return brightestColors;
}

export default class Fetch extends BaseCommand {
  public static commandName = 'fetch'
  public static description = ''

  public static settings = {
    loadApp: false,
    stayAlive: true,
  }


  public async run() {
    this.logger.info('Hello world!')

    const { data: list } = await axios.get('https://bymykel.github.io/CSGO-API/api/ru/skins.json');

    console.warn('start')
    let i = 0
    const out = await Promise.all(list.map(async (item) => {
      // let v = new Vibrant(item.image, {
      //   quality: 1,
      // })
      // const vibrant = await v.getPalette()

      // console.info(await ColorThief.getPalette(item.image, 5))

      const colors = (await ColorThief.getPalette(item.image, 6)).map(v => (rgbToHex(v)))

      const resul = ({
        ...item,
        palette: {
          primary: avgcolor(findBrightestColors(colors)),
          secondary: colors,
        }
      })

      i++;

      console.info(i)
      return resul;

    }))

    console.warn('write');
    fs.writeFileSync('/workspace/csgo-chooser/res.json', JSON.stringify(out))
    console.warn('done');

  }
}
