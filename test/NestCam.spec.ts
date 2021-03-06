import { Logging, HAP } from 'homebridge';
import { PlatformAccessory } from 'homebridge/lib/platformAccessory';
import { Logger } from 'homebridge/lib/logger';
import { NestCam } from '../src/nest/cam';
import { CameraInfo } from '../src/nest/models/camera';
import { NestConfig } from '../src/nest/models/config';
import { Connection } from '../src/nest/connection';
import { NestEndpoints } from '../src/nest/endpoints';

let hap: HAP;
const log: Logging = Logger.withPrefix('[test]');

const getCamera = async function (config: NestConfig): Promise<CameraInfo> {
  const endpoints = new NestEndpoints(false);
  const response = await endpoints.sendRequest(
    config.access_token,
    endpoints.CAMERA_API_HOSTNAME,
    '/api/cameras.get_owned_and_member_of_with_properties',
    'GET',
  );
  const camera: CameraInfo = response.items[0];
  return camera;
};

test('checkAlerts works as expected', async () => {
  expect.assertions(1);
  const config: NestConfig = {
    platform: 'test',
    googleAuth: {
      issueToken: process.env.ISSUE_TOKEN,
      cookies: process.env.COOKIES,
    },
    fieldTest: false,
  };
  const connection = new Connection(config, log);
  const connected = await connection.auth();
  if (connected) {
    const cameraInfo = await getCamera(config);
    const uuid = '00000000-0000-0000-0000-000000000000';
    const accessory: PlatformAccessory = new PlatformAccessory('test', uuid);
    const camera = new NestCam(config, cameraInfo, accessory, log, hap);
    return expect(camera.checkAlerts()).resolves.toBeUndefined();
  } else {
    throw new Error('Could not connect');
  }
});
