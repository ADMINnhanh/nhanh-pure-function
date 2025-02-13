import { _FileTypeChecker, _GetHrefName } from "./Utility/Utility";

let value: any = _GetHrefName(
  "https://fastly.picsum.photos/id/841/805/453.jpg?hmac=RMVB2BBB6T34wI08nwWz1urBgdzSQxNR6L48hkOsTNo"
);

console.log(value);

value = _FileTypeChecker.parseAddresses(
  "https://emergency.wjtsc.com:1128/resources/life-cycle/test/1-110000251006481.pcm,https://emergency.wjtsc.com:1128/resources/life-cycle/test/car-828972667665784.mp3,https://emergency.wjtsc.com:1128/resources/life-cycle/test/317361004975528.jpg"
);
console.log(value);
