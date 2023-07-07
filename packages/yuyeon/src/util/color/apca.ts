///////////////////////////////////////////////////////////////////////////////
/** @preserve
 /////    SAPC APCA - Advanced Perceptual Contrast Algorithm
 /////           Beta 0.1.9 W3 • contrast function only
 /////           DIST: W3 • Revision date: July 3, 2022
 /////    Function to parse color values and determine Lc contrast
 /////    Copyright © 2019-2022 by Andrew Somers. All Rights Reserved.
 /////    LICENSE: W3 LICENSE
 /////    CONTACT: Please use the ISSUES or DISCUSSIONS tab at:
 /////    https://github.com/Myndex/SAPC-APCA/
 /////
 ///////////////////////////////////////////////////////////////////////////////
 /////
 /////    MINIMAL IMPORTS:
 /////      import { APCAcontrast, sRGBtoY, displayP3toY,
/////               calcAPCA, fontLookupAPCA } from 'apca-w3';
 /////      import { colorParsley } from 'colorparsley';
 /////
 /////    FORWARD CONTRAST USAGE:
 /////      Lc = APCAcontrast( sRGBtoY( TEXTcolor ) , sRGBtoY( BACKGNDcolor ) );
 /////    Where the colors are sent as an rgba array [255,255,255,1]
 /////
 /////    Retrieving an array of font sizes for the contrast:
 /////      fontArray = fontLookupAPCA(Lc);
 /////
 /////    Live Demonstrator at https://www.myndex.com/APCA/
 // */
///////////////////////////////////////////////////////////////////////////////

/////  Module Scope Object Containing Constants  /////
/////   APCA   0.0.98G - 4g - W3 Compatible Constants

/////  𝒦 SA98G  ///////////////////////////////////
const SA98G = {
  mainTRC: 2.4, // 2.4 exponent for emulating actual monitor perception

  // For reverseAPCA
  get mainTRCencode() {
    return 1 / this.mainTRC;
  },

  // sRGB coefficients
  sRco: 0.2126729,
  sGco: 0.7151522,
  sBco: 0.072175,

  // G-4g constants for use with 2.4 exponent
  normBG: 0.56,
  normTXT: 0.57,
  revTXT: 0.62,
  revBG: 0.65,

  // G-4g Clamps and Scalers
  blkThrs: 0.022,
  blkClmp: 1.414,
  scaleBoW: 1.14,
  scaleWoB: 1.14,
  loBoWoffset: 0.027,
  loWoBoffset: 0.027,
  deltaYmin: 0.0005,
  loClip: 0.1,

  ///// MAGIC NUMBERS for UNCLAMP, for use with 0.022 & 1.414 /////
  // Magic Numbers for reverseAPCA
  mFactor: 1.9468554433171,
  get mFactInv() {
    return 1 / this.mFactor;
  },
  mOffsetIn: 0.0387393816571401,
  mExpAdj: 0.283343396420869,
  get mExp() {
    return this.mExpAdj / this.blkClmp;
  },
  mOffsetOut: 0.312865795870758,
};

//////////////////////////////////////////////////////////////////////////////
//////////  LUMINANCE CONVERTERS  |//////////////////////////////////////////

//////////  ƒ  sRGBtoY()  //////////////////////////////////////////////////
export function sRGBtoY(rgb = [0, 0, 0]) {
  // send sRGB 8bpc (0xFFFFFF) or string

  // NOTE: Currently expects 0-255

  /////   APCA   0.0.98G - 4g - W3 Compatible Constants   ////////////////////
  /*
  const mainTRC = 2.4; // 2.4 exponent emulates actual monitor perception

  const sRco = 0.2126729,
        sGco = 0.7151522,
        sBco = 0.0721750; // sRGB coefficients
        */
  // Future:
  // 0.2126478133913640	0.7151791475336150	0.0721730390750208
  // Derived from:
  // xW	yW	K	xR	yR	xG	yG	xB	yB
  // 0.312720	0.329030	6504	0.640	0.330	0.300	0.600	0.150	0.060

  // linearize r, g, or b then apply coefficients
  // and sum then return the resulting luminance

  function simpleExp(chan: number) {
    return Math.pow(chan / 255.0, SA98G.mainTRC);
  }

  return (
    SA98G.sRco * simpleExp(rgb[0]) +
    SA98G.sGco * simpleExp(rgb[1]) +
    SA98G.sBco * simpleExp(rgb[2])
  );
}

export function APCAcontrast(txtY: number, bgY: number, places = -1) {
  // send linear Y (luminance) for text and background.
  // txtY and bgY must be between 0.0-1.0
  // IMPORTANT: Do not swap, polarity is important.

  const icp = [0.0, 1.1]; // input range clamp / input error check

  if (
    isNaN(txtY) ||
    isNaN(bgY) ||
    Math.min(txtY, bgY) < icp[0] ||
    Math.max(txtY, bgY) > icp[1]
  ) {
    return 0.0; // return zero on error
    // return 'error'; // optional string return for error
  }

  //////////   SAPC LOCAL VARS   /////////////////////////////////////////

  let SAPC = 0.0; // For raw SAPC values
  let outputContrast = 0.0; // For weighted final values
  let polCat = 'BoW'; // Alternate Polarity Indicator. N normal R reverse

  // TUTORIAL

  // Use Y for text and BG, and soft clamp black,
  // return 0 for very close luminances, determine
  // polarity, and calculate SAPC raw contrast
  // Then scale for easy to remember levels.

  // Note that reverse contrast (white text on black)
  // intentionally returns a negative number
  // Proper polarity is important!

  //////////   BLACK SOFT CLAMP   ////////////////////////////////////////

  // Soft clamps Y for either color if it is near black.
  txtY =
    txtY > SA98G.blkThrs
      ? txtY
      : txtY + Math.pow(SA98G.blkThrs - txtY, SA98G.blkClmp);
  bgY =
    bgY > SA98G.blkThrs
      ? bgY
      : bgY + Math.pow(SA98G.blkThrs - bgY, SA98G.blkClmp);

  ///// Return 0 Early for extremely low ∆Y
  if (Math.abs(bgY - txtY) < SA98G.deltaYmin) {
    return 0.0;
  }

  //////////   APCA/SAPC CONTRAST - LOW CLIP (W3 LICENSE)  ///////////////

  if (bgY > txtY) {
    // For normal polarity, black text on white (BoW)

    // Calculate the SAPC contrast value and scale
    SAPC =
      (Math.pow(bgY, SA98G.normBG) - Math.pow(txtY, SA98G.normTXT)) *
      SA98G.scaleBoW;

    // Low Contrast smooth rollout to prevent polarity reversal
    // and also a low-clip for very low contrasts
    outputContrast = SAPC < SA98G.loClip ? 0.0 : SAPC - SA98G.loBoWoffset;
  } else {
    // For reverse polarity, light text on dark (WoB)
    // WoB should always return negative value.
    polCat = 'WoB';

    SAPC =
      (Math.pow(bgY, SA98G.revBG) - Math.pow(txtY, SA98G.revTXT)) *
      SA98G.scaleWoB;

    outputContrast = SAPC > -SA98G.loClip ? 0.0 : SAPC + SA98G.loWoBoffset;
  }

  // return Lc (lightness contrast) as a signed numeric value
  // Round to the nearest whole number as string is optional.
  // Rounded can be a signed INT as output will be within ± 127
  // places = -1 returns signed float, 1 or more set that many places
  // 0 returns rounded string, uses BoW or WoB instead of minus sign

  if (places < 0) {
    // Default (-1) number out, all others are strings
    return outputContrast * 100.0;
  } else if (places == 0) {
    return (
      Math.round(Math.abs(outputContrast) * 100.0) + '<sub>' + polCat + '</sub>'
    );
  } else if (Number.isInteger(places)) {
    return (outputContrast * 100.0).toFixed(places);
  } else {
    return 0.0;
  }
}

// send rgba array for text/icon, rgb for background.
// Only foreground allows alpha of 0.0 to 1.0
// This blends using gamma encoded space (standard)
// rounded 0-255 or set round=false for number 0.0-255.0
export function alphaBlend(
  rgbaFG = [0, 0, 0, 1.0],
  rgbBG = [0, 0, 0],
  round = true,
) {
  rgbaFG[3] = Math.max(Math.min(rgbaFG[3], 1.0), 0.0); // clamp alpha 0-1
  let compBlend = 1.0 - rgbaFG[3];
  let rgbOut = [0, 0, 0, 1, true]; // or just use rgbBG to retain other elements?

  for (let i = 0; i < 3; i++) {
    rgbOut[i] = rgbBG[i] * compBlend + rgbaFG[i] * rgbaFG[3];
    if (round) rgbOut[i] = Math.min(Math.round(rgbOut[i] as number), 255);
  }
  return rgbOut;
}
