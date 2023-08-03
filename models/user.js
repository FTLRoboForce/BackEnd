const db = require("../db");
const bcrypt = require("bcrypt");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secretKey = crypto.randomBytes(64).toString("hex");
const { SECRET_KEY } = require("../config");

const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
  /**
   * Register user with data.
   *
   * Throws BadRequestError on duplicates.
   *
   * @returns user
   **/

  static async register(creds) {
    const {
      email,
      password,
      firstname,
      lastname,
      username,
      points,
      photo,
      totalquiz
    } = creds;
    const requiredCreds = [
      "email",
      "password",
      "firstname",
      "lastname",
      "username",
      "points",
      "totalquiz"
    ];

    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    if (username.length < 3) {
      throw new BadRequestError("Username must be at least 3 characters");
    }

    if (email.indexOf("@") <= 0) {
      throw new BadRequestError("Invalid email");
    }

    const existingUserWithEmail = await User.fetchUserByEmailRegister(email);
    if (existingUserWithEmail) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const normalizedEmail = email.toLowerCase();

    const result = await db.query(
      `INSERT INTO users (
          password,
          firstname,
          lastname,
          username,
          email,
          points,
          photo,
          totalquiz
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id,
                  email,            
                  firstname AS "firstname",
                  lastname AS "lastname",
                  username
                  `,
      [
        hashedPassword,
        firstname,
        lastname,
        username,
        normalizedEmail,
        points,
        photo,
        totalquiz
      ]
    );

    const user = result.rows[0];

    return user;
  }

  static async updatePhoto(update) { 
    const { email, photo } = update;
    console.log("updatePhoto", email, photo);
    const result = await db.query(
      `UPDATE users SET
          photo = $2
          WHERE email = $1
          RETURNING id,
                  email,
                  firstname AS "firstname",
                  lastname AS "lastname",
                  username,
                  points,
                  photo,
                  totalquiz;
          `,
      [email, photo]
    );
    console.log(result.rows[0]);
    const user = result.rows[0];

    return user;
  }

  /**
   * Fetch a user in the database by email
   *
   * @param {String} email
   * @returns user
   */

  static async fetchUserByEmailRegister(email) {
    console.log("fetchUserByEmailRegister", email);
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase()
    ]);
    const user = rows[0];
    console.log("user fetched", user);
    if (user) {
      return user;
    }
  }

  static async fetchUserByEmail(creds) {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      creds.email
    ]);
    const user = rows[0];
    if (user) {
      const isPasswordValid = await bcrypt.compare(
        creds.password,
        user.password
      );
      if (isPasswordValid) {
        return user;
      }
    }
  }

  static async addQuiz(quiz) {
    try {
      const { userid, questions, points, subject, difficulty } = quiz;
      const result = await db.query(
        `INSERT INTO quizzes (
          user_id,
          questions,
          points,
          subject,
          difficulty
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING quiz_id,
                  user_id, 
                  questions,
                  points,
                  subject,
                  difficulty
                  `,
        [userid, questions, points, subject, difficulty]
      );

      const quizResult = result.rows[0];

      return quizResult;
    } catch (err) {
      console.log(err);
    }
  }

  static async listQuiz(userid) {
    const result = await db.query(
      `SELECT quiz_id,
              questions,
              points,
              subject,
              difficulty
            FROM quizzes
            WHERE user_id = $1
`,
      [userid.userid]
    );

    const quiz = result.rows;

    return quiz;
  }

  static async updateUser(update) {
    const { email, points } = update;

    const result = await db.query(
      `UPDATE users SET
          points = points + $2 ,
          totalquiz = totalquiz + 1
          WHERE email = $1
          RETURNING points;
          `,
      [email, points]
    );

    const user = result.rows[0];

    return user;
  }

  static async fetchAll() {
    const result = await db.query(
      `SELECT id,
              username,
              points,
              created,
              photo,
              totalquiz
            FROM users
            ORDER BY points DESC`
    );

    const users = result.rows;

    return users;
  }

  /**
   * Fetch a user in the database by email
   *
   * @param {String} userId
   * @returns user
   */
  static async fetchById(userId) {
    const result = await db.query(
      `SELECT id,
              email,    
              password,
              firstname AS "firstname",
              "lastname" AS "lastname",         
           FROM users
           WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];

    return user;
  }

  static async generateAuthToken(user) {
    const payload = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      username: user.username,
      points: user.points,
      photo: user.photo,
      totalquiz: user.totalquiz
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    console.log("token", token);
    return token;
  }

  static async verifyAuthToken(token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded;
    } catch (err) {
      return null;
    }
  }
}
module.exports = User;
