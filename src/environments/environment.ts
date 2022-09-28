// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
let apiUrlDotNet="http://localhost:8080/api/v1";
// if(window.location.host.includes('localhost'))
// {
//   apiUrlDotNet="http://localhost:8080/api/v1";
// }
export const environment = {
  production: false,
  apiUrlDotNet:apiUrlDotNet
};

/*
{
"email": "sapana.firke@arsteg.com?",
"password": "password"
}
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
