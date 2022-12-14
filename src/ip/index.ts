import { command, commandSync } from 'execa';
import { v4 } from 'internal-ip';
import * as fs from 'fs';
import * as os from 'os';

export const isInKubernetes = async (): Promise<boolean> => {
  const platform = os.platform();

  if (platform === 'darwin' || platform === 'win32') {
    return false;
  }

  const { stdout } = await command('printenv');

  return stdout.indexOf('KUBERNETES') !== -1;
};

export const isInKubernetesSync = (): boolean => {
  const platform = os.platform();

  if (platform === 'darwin' || platform === 'win32') {
    return false;
  }

  const { stdout } = commandSync('printenv');

  return stdout.indexOf('KUBERNETES') !== -1;
};

export const isInDocker = async (): Promise<boolean> => {
  const platform = os.platform();

  if (platform === 'darwin' || platform === 'win32') {
    return false;
  }

  const file = await fs.promises.readFile('/proc/self/cgroup', 'utf-8');

  return file.indexOf('/docker') !== -1;
};

export const isInDockerSync = (): boolean => {
  const platform = os.platform();

  if (platform === 'darwin' || platform === 'win32') {
    return false;
  }

  const file = fs.readFileSync('/proc/self/cgroup', 'utf-8');

  return file.indexOf('/docker') !== -1;
};

export const ipSync = (): string => {
  if (isInKubernetesSync() || isInDockerSync()) {
    return commandSync('hostname -i').stdout.trim();
  }

  // Common Env
  const ip = v4.sync();

  if (ip) {
    return ip;
  }

  throw new Error('Attempted to call the method from outside docker container or kubernetes pod!');
};

export const ip = async (): Promise<string> => {
  if ((await isInKubernetes()) || (await isInDocker())) {
    return (await command('hostname -i')).stdout.trim();
  }

  // Common Env
  const ip = await v4();

  if (ip) {
    return ip;
  }

  throw new Error('Attempted to call the method from outside docker container or kubernetes pod!');
};
