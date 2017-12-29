const fs = require('fs')
const parser = require('subtitles-parser')
const ffmpeg = require('fluent-ffmpeg')
const async = require('async')

const srt = fs.readFileSync('./data/prison_break _5x05.srt', 'utf8')
const data = parser.fromSrt(srt, true)

async.eachOfLimit(data, 1, (part, i, callback) => {
  if (part.text.startsWith('[')) {
    callback()
  } else {
    console.log(part)
    process('part_' + i, part, callback)
  }
})

function process (name, part, callback) {
  let start = milToSec(part.startTime)
  let end = milToSec(part.endTime)
  let diff = roundTwoDigits(end - start)
  let partName = 'parts/' + name + '.mp4'
  return cutPart(start, diff, partName, callback)
}

function cutPart (start, dur, name, callback) {
  console.log(start, dur, name)
  ffmpeg('./data/prison_break _5x05.mp4')
    .setStartTime(start)
    .setDuration(dur)
    .on('start', function (commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine)
    })
    .on('error', function (err) {
      console.log('An error occurred: ' + err.message)
      callback()
    })
    .on('end', function () {
      console.log('Processing finished !')
      callback()
    })
    .save(name)
}

function roundTwoDigits (n) {
  return Math.round((n * 100)) / 100
}

function milToSec (t) {
  return t / 1000
}

