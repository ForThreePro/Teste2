import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { watchFile, unwatchFile, existsSync, mkdirSync } from 'fs';
import cfonts from 'cfonts';
import './plugins/serbot-serbot.js';
import { createInterface } from 'readline';
import yargs from 'yargs';
import chalk from 'chalk';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, version } = require(join(__dirname, './package.json'));
const rl = createInterface(process.stdin, process.stdout);

const inicializarEntorno = () => {
  const carpetas = ['tmp', 'Sesiones/Subbots', 'Sesiones/Principal'];
  carpetas.forEach(dir => {
    if (dir?.trim() &&!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

const mostrarBanner = () => {
  cfonts.say('GARFIELD', {
    font: 'block',
    align: 'center',
    colors: ['yellow', 'red'],
    background: 'black',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0'
  });

  cfonts.say('BOT MD v2.6 PRO', {
    font: 'console',
    align: 'center',
    colors: ['yellow']
  });

  cfonts.say('La pereza es mi superpoder', {
    font: 'tiny',
    align: 'center',
    colors: ['orange']
  });

  console.log(chalk.hex('#FFA500')('🍕 N°1 EN TODO EL MUNDO 🌎 🍕'));
  console.log(chalk.hex('#FFA500')('Owner: @Garfiel Store\n'));
};

let ejecucionActiva = false;
let procesoHijo;

const ejecutarProceso = (archivo) => {
  if (ejecucionActiva) return;
  ejecucionActiva = true;

  const rutaArchivo = join(__dirname, archivo);
  const argumentos = [rutaArchivo,...process.argv.slice(2)];

  procesoHijo = spawn('node', argumentos, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });

  procesoHijo.on('message', codigo => {
    if (codigo === 'reset') {
      procesoHijo.kill();
      ejecucionActiva = false;
      ejecutarProceso(archivo);
    } else if (codigo === 'uptime') {
      procesoHijo.send(process.uptime());
    }
  });

  procesoHijo.on('exit', estado => {
    ejecucionActiva = false;
    console.error(chalk.red('🚩 ZZZ... Garfield se quedó dormido :\n'), estado);
    console.log(chalk.yellow('🍕 Reiniciando para más lasaña...\n'));
    process.exit();
  });

  const opciones = yargs(process.argv.slice(2)).exitProcess(false).parse();
  if (!opciones['test'] &&!rl.listenerCount('line')) {
    rl.on('line', entrada => {
      if (procesoHijo?.connected) {
        procesoHijo.send(entrada.trim());
      }
    });
  }

  watchFile(argumentos[0], () => {
    unwatchFile(argumentos[0]);
    if (procesoHijo) procesoHijo.kill();
    ejecucionActiva = false;
    ejecutarProceso(archivo);
  });
};

process.on('warning', alerta => {
  if (alerta.name === 'MaxListenersExceededWarning') {
    console.warn(chalk.yellow('🚩 Se excedió el límite de Listeners en :'));
    console.warn(chalk.gray(alerta.stack));
  }
});

inicializarEntorno();
console.log(chalk.hex('#FFA500')('😼 Iniciando GARFIELD BOT...'));
console.log(chalk.hex('#FFD700')('🍕 Cargando lasaña virtual...'));
console.log(chalk.hex('#FFA500')('⚡ Sistema: Estable | Ping: 70ms'));
console.log(chalk.hex('#FFA500')('━━━━━━━━━━━━━━\n'));
mostrarBanner();
ejecutarProceso('main.js');