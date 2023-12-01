import { AcmsClient } from './core';

export default function createClient(
  ...args: ConstructorParameters<typeof AcmsClient>
) {
  return new AcmsClient(...args);
}
