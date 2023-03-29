"use strict";
const { Issue } = require("../models/issue");
const updateableFields = new Set([
  "issue_title",
  "issue_text",
  "created_by",
  "assigned_to",
  "status_text",
  "open",
]);
const validFilterFields = new Set([
  ...updateableFields,
  "_id",
  "created_on",
  "updated_on",
]);

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(async (req, res) => {
      let project = req.params.project;
      const filters = req.query;
      const query = { project };
      for (let key of Object.keys(filters)) {
        if (validFilterFields.has(key)) {
          query[key] = key == "open" ? Boolean(filters[key]) : filters[key];
        }
      }
      // console.log(query);
      try {
        const data = await Issue.find(query).select("-project -__v").lean();
        // console.log(data);
        res.json(data);
      } catch (err) {
        console.error(err);
      }
    })
    .post(async (req, res) => {
      let project = req.params.project;
      const { assigned_to, status_text, issue_title, issue_text, created_by } =
        req.body;
      // console.log(assigned_to + ", " + status_text);

      if (!issue_text || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      const issue = { project, issue_title, issue_text, created_by };
      if (assigned_to) issue.assigned_to = assigned_to;
      if (status_text) issue.status_text = status_text;

      try {
        const issueFromDB = await Issue.create(issue);
        const {
          assigned_to,
          status_text,
          open,
          _id,
          issue_title,
          issue_text,
          created_by,
          created_on,
          updated_on,
        } = issueFromDB;
        const response = {
          assigned_to,
          status_text,
          open,
          _id,
          issue_title,
          issue_text,
          created_by,
          created_on,
          updated_on,
        };
        // console.log(response);
        res.json(response);
      } catch (err) {
        console.error(err);
      }
    })
    .put(async (req, res) => {
      const { _id } = req.body;
      if (!_id) return res.json({ error: "missing _id" });

      const couldNotUpdateErrMsg = "could not update";
      const noUpdateFieldsErrMsg = "no update field(s) sent";
      let data;

      try {
        const update = Object.create(null);
        for (let key of Object.keys(req.body)) {
          if (updateableFields.has(key)) {
            update[key] =
              key == "open" ? Boolean(req.body[key]) : req.body[key];
          }
        }
        if (Object.keys(update).length === 0)
          return res.json({ error: noUpdateFieldsErrMsg, _id });

        update.updated_on = new Date().toISOString();
        data = await Issue.findByIdAndUpdate(_id, update, { new: true }).exec();
        if (data) {
          return res.json({
            _id,
            result: "successfully updated",
          });
        }
        return res.json({ _id, error: couldNotUpdateErrMsg });
      } catch (err) {
        console.error(err);
        return res.json({ _id, error: couldNotUpdateErrMsg });
      }
    })
    .delete(async (req, res) => {
      const { _id } = req.body;

      if (_id === undefined) {
        res.json({ error: "missing _id" });
        return;
      }

      const errorMsg = "could not delete";
      const isBadBody = Object.keys(req.body).length > 1;
      if (_id == "" || isBadBody) {
        res.json({ _id, error: errorMsg });
        return;
      }

      try {
        let data = await Issue.findById(_id).exec();
        if (!data || data == undefined) {
          res.json({ _id, error: errorMsg });
          return;
        }

        data = await Issue.findByIdAndDelete(_id).exec();
        res.json({ _id, result: "successfully deleted" });
      } catch (err) {
        console.error(err);
        res.json({ _id, error: errorMsg });
      }
    });
};
