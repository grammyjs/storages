import fs from 'fs';


function argPath(search: string) {
  const findPathArg = process.argv.find((arg) => arg.includes(`--${search}=`));
  if (!findPathArg) {
    return undefined;
  }

  return findPathArg.replace(`--${search}=`, '');
}

let path = argPath('path');

if (!path) {
  console.log('--path are required args');
  path = 'dist';
} else {
  path = `${process.cwd()}/${path}`;
  console.log(path);
  fs.writeFileSync(path + '/cjs/package.json', '{"type":"commonjs"}');
  fs.writeFileSync(path + '/esm/package.json', '{"type":"module"}');
  console.log('postbuild completed...');
}