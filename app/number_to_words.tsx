import React from 'react';

const scales = ['billions', 'millions', 'thousands', 'hundreds'];

const pluralize = (number, scale) => {
  const pluralizations = {
    thousands: {
      singular: 'mil',
      plural: 'mil',
    },
    millions: {
      singular: 'milhão',
      plural: 'milhões',
    },
    billions: {
      singular: 'bilhão',
      plural: 'bilhões',
    },
    hundreds: {
      singular: '',
      plural: '',
    },
  };
  if (number === 1) {
    return number.toString() + ' ' + pluralizations[scale].singular;
  }
  return number.toString() + ' ' + pluralizations[scale].plural;
};

const numberToWords = (number, scale) => {
  const numbers = number.toString().split('.');
  const parts = [];
  if (numbers[0] !== '0') {
    parts.push(pluralize(parseInt(numbers[0]), scale));
  }
  if (numbers[1] && parseInt(numbers[1]) > 0) {
    parts.push(pluralize(parseInt(numbers[1]), scales[scales.indexOf(scale) + 1]));
  }
  return parts;
};

export const numberToWordsInPortuguese = (number, label) => {
  let scale = 'hundreds';
  if (/bilhões de reais/.test(label)) {
    scale = 'billions';
  }
  if (/milhões de reais/.test(label)) {
    scale = 'millions';
  }
  if (/milhares de reais/.test(label)) {
    scale = 'thousands';
  }
  const parts = numberToWords(number, scale);
  return buildSentence(parts);
};

const buildSentence = (parts) => {
  let preposition = 'de';
  if (/mil($|,)/.test(parts.join(',')) || /^[0-9]+$/.test(parts.join(',').trim())) {
    preposition = '';
  }
  return parts.join(', ').replace(/,([^,]+)$/, ' e $1') + ' ' + preposition + ' reais';
};

const NumberToWords = (props) => (
  <>
    {numberToWordsInPortuguese(props.number, props.label)}
  </>
);

export default NumberToWords;
