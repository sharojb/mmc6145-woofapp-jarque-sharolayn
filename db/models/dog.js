import { Schema } from 'mongoose'

const dogSchema = new Schema({
  name: String,
  min_height: Number,
  max_height: Number,
  min_life_expectancy: [String],
  thumbnail: String,
  energy: String,
  previewLink: String,
})

export default dogSchema