let apiUrlDotNet="http://arstegeffortlesshrmapi-dev.us-east-1.elasticbeanstalk.com/api/v1";
if(window.location.host.includes('localhost'))
{
  apiUrlDotNet="http://arstegeffortlesshrmapi-dev.us-east-1.elasticbeanstalk.com/api/v1/";
}
export const environment = {
  production: true,
  apiUrlDotNet:apiUrlDotNet
};
