const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const defaultString = "";

const issueSchema = new Schema({
  assigned_to: {
    type: String,
    default: defaultString,
  },
  status_text: {
    type: String,
    default: defaultString,
  },
  open: {
    type: Boolean,
    required: true,
    default: true,
  },
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updated_on: {
    type: Date,
    required: true,
    default: Date.now,
  },
  project: {
    type: String,
    required: true,
  },
});

const Issue = model("Issue", issueSchema);

module.exports = {
  Issue,
};
