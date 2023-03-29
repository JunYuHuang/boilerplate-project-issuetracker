const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const API_ROOT = "/api/issues/";
let API_TEST = `${API_ROOT}test_${Date.now()}`;
let id1, id2;

suite("Functional Tests", () => {
  test(`Create an issue with every field: POST request to ${API_TEST}`, (done) => {
    const reqBody = {
      assigned_to: "tester1",
      status_text: "in test",
      issue_title: "POST issue with every field",
      issue_text: "All fields filled",
      created_by: "tester1",
    };
    chai
      .request(server)
      .post(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.equal(res.status, 200);
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
        } = res.body;
        assert.deepEqual(
          {
            assigned_to,
            status_text,
            issue_title,
            issue_text,
            created_by,
          },
          reqBody
        );
        assert.strictEqual(open, true);
        assert.isNotEmpty(_id);
        assert.property(res.body, "created_on");
        assert.isNumber(Date.parse(created_on));
        assert.property(res.body, "updated_on");
        assert.isNumber(Date.parse(updated_on));
        id1 = _id;
        done();
      });
  });
  test(`Create an issue with only required fields: POST request to ${API_TEST}`, (done) => {
    const reqBody = {
      issue_title: "POST issue with only required fields",
      issue_text: "Only required fields filled",
      created_by: "tester2",
    };
    chai
      .request(server)
      .post(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.equal(res.status, 200);
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
        } = res.body;
        assert.deepEqual(
          {
            issue_title,
            issue_text,
            created_by,
          },
          reqBody
        );
        assert.equal(assigned_to, "");
        assert.equal(status_text, "");
        assert.strictEqual(open, true);
        assert.isNotEmpty(_id);
        assert.property(res.body, "created_on");
        assert.isNumber(Date.parse(created_on));
        assert.property(res.body, "updated_on");
        assert.isNumber(Date.parse(updated_on));
        id2 = _id;
        done();
      });
  });
  test(`Create an issue with missing required fields: POST request to ${API_TEST}`, (done) => {
    const reqBody = {
      issue_title: "POST issue with missing required fields",
    };
    chai
      .request(server)
      .post(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  test(`View issues on a project: GET request to ${API_TEST}`, (done) => {
    chai
      .request(server)
      .get(API_TEST)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 2);
        for (const issue of res.body) {
          assert.property(issue, "issue_title");
          assert.property(issue, "issue_text");
          assert.property(issue, "created_by");
          assert.property(issue, "assigned_to");
          assert.property(issue, "status_text");
          assert.property(issue, "open");
          assert.property(issue, "created_on");
          assert.property(issue, "updated_on");
          assert.property(issue, "_id");
        }
        done();
      });
  });
  test(`View issues on a project with one filter: GET request to ${API_TEST}`, (done) => {
    chai
      .request(server)
      .get(`${API_TEST}?created_by=tester1`)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 1);
        done();
      });
  });
  test(`View issues on a project with multiple filters: GET request to ${API_TEST}`, (done) => {
    chai
      .request(server)
      .get(`${API_TEST}?created_by=tester1&assigned_to=tester3`)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.lengthOf(res.body, 0);
        done();
      });
  });
  // TODO
  test(`Update one field on an issue: PUT request to ${API_TEST}`, (done) => {
    const reqBody = {
      _id: id1,
      issue_title: "PUT issue that updates 1 field",
    };
    chai
      .request(server)
      .put(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: id1,
        });
        // assert.isAbove(
        //   Date.parse(res.body.updated_on),
        //   Date.parse(res.body.created_on)
        // );
        done();
      });
  });
  // TODO
  test(`Update multiple fields on an issue: PUT request to ${API_TEST}`, (done) => {
    const reqBody = {
      _id: id2,
      issue_title: "PUT issue that updates multiple fields",
      issue_text: "Updated issue text from PUT test to update multiple fields",
    };
    chai
      .request(server)
      .put(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: id2,
        });
        // assert.isAbove(
        //   Date.parse(res.body.updated_on),
        //   Date.parse(res.body.created_on)
        // );
        done();
      });
  });
  test(`Update an issue with missing _id: PUT request to ${API_TEST}`, (done) => {
    chai
      .request(server)
      .put(API_TEST)
      .send({})
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          error: "missing _id",
        });
        done();
      });
  });
  test(`Update an issue with no fields to update: PUT request to ${API_TEST}`, (done) => {
    const reqBody = { _id: id2 };
    chai
      .request(server)
      .put(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          _id: reqBody._id,
          error: "no update field(s) sent",
        });
        done();
      });
  });
  test(`Update an issue with an invalid _id: PUT request to ${API_TEST}`, (done) => {
    const reqBody = { _id: "asdfjkl;", issue_text: "some new description" };
    chai
      .request(server)
      .put(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          _id: reqBody._id,
          error: "could not update",
        });
        done();
      });
  });
  test(`Delete an issue: DELETE request to ${API_TEST}`, (done) => {
    const reqBody = { _id: id1 };
    chai
      .request(server)
      .delete(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          _id: reqBody._id,
          result: "successfully deleted",
        });
        done();
      });
  });
  test(`Delete an issue with an invalid _id: DELETE request to ${API_TEST}`, (done) => {
    const reqBody = { _id: "ass" };
    chai
      .request(server)
      .delete(API_TEST)
      .send(reqBody)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          _id: reqBody._id,
          error: "could not delete",
        });
        done();
      });
  });
  test(`Delete an issue with missing _id: DELETE request to ${API_TEST}`, (done) => {
    chai
      .request(server)
      .delete(API_TEST)
      .send({})
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        assert.deepEqual(res.body, {
          error: "missing _id",
        });
        done();
      });
  });
});
