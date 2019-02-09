import { readFile, writeFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

export const ensurePath = async (path: string[], clear: boolean = false) => {
  if (clear)
    await new Promise((rs, rj) => {
      rimraf(resolve(...path), err => {
        if (err) rj(err)
        else rs()
      })
    })

  await new Promise((rs, rj) => {
    mkdirp(resolve(...path), err => {
      if (err) rj(err)
      else rs()
    })
  })
}

export const requireModuleFromPath = (path: string[]) => require(resolve(...path))

export const readFileFromPath = (path: string[]) => readFileAsync(resolve(...path)).then(b => b.toString())

export const writeFileToPath = (path: string[], content: string) => writeFileAsync(resolve(...path), content)
