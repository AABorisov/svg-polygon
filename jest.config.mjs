import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})


const config = {
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "coverageProvider": "v8"
}

export default createJestConfig(config)
