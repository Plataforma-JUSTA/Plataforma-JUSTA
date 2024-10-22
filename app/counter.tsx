import React from 'react';
import CountUp from 'react-countup';
import { ourParseFloat } from './helpers';

export default function Counter({ value }) {
  const parts = value.match(/^([^0-9]+)([0-9,]+)([^0-9]+)$/);
  if (!parts) {
    return (
      <div>{value}</div>
    );
  }

  const number = ourParseFloat(parts[2]);

  let decimals = 0;
  if (/,/.test(value)) {
    decimals = 1;
  }

  return (
    <div className="counter" key={value}>
      <div>{parts[1]}</div>
      <div><CountUp separator="." decimal="," end={number} delay={0} duration={3} decimals={decimals} /></div>
      <div>{parts[3]}</div>
    </div>
  );
};
