const bcrypt = require("bcrypt");
const User = require("../models/user");
const Openai = require("../routes/openai");
const express = require("express");
const request = require("supertest");

const { BadRequestError } = require("../errors");
const db = require("../db"); // Assuming you have a database connection
const jwt = require("jsonwebtoken"); // Import jwt module

const app = express();
app.use(express.json());
app.use("/openai", Openai);

jest.mock("../db"); // Mock the db module

// Clear the necessary tables or collections
const clearDatabase = async () => {
  await db.query("TRUNCATE TABLE users CASCADE"); // Example for PostgreSQL, adjust for your database
  // Add more truncate/drop statements for other tables or collections if needed
};

// Run the clearDatabase function before each test
beforeEach(async () => {
  await clearDatabase();
});

describe("API Routes", () => {
  test("should create flashcards", async () => {
    const response = await request(app).post("/openai/flashcards").send({
      number: 5,
      difficultyLevel: "medium",
      subject: "Math",
      optionalSection: "Algebra"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeTruthy();
  }, 10000);

  test("should create quizzes", async () => {
    const response = await request(app).post("/openai/quiz").send({
      number: 5,
      difficultyLevel: "hard",
      subject: "Science",
      optionalSection: "Physics"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeTruthy();
  }, 15000);

  test("should respond to challenges", async () => {
    const response = await request(app)
      .post("/openai/challenge")
      .send({
        question: "What is the capital of France?",
        answer: "Paris",
        options: ["New York", "London", "Paris", "Dublin"]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeTruthy();
  }, 10000);

  test("should explain questions", async () => {
    const response = await request(app)
      .post("/openai/explain")
      .send({
        question: "What is photosynthesis?",
        answer: "Photosynthesis is the process...",
        options: ["Process A", "Process B", "Photosynthesis", "Process C"]
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeTruthy();
  }, 10000);
});

describe("User Model - register", () => {
  beforeEach(() => {
    // Reset the mock implementation for each test
    db.query.mockReset();
  });

  test("should register a new user", async () => {
    // Mock the db query method to return a mock user
    const mockUser = {
      email: "test12345@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      password: "password123",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Mock the bcrypt hash method to return a hashed password
    bcrypt.hash = jest.fn().mockResolvedValueOnce("hashedPassword");

    // Mock the normalized email value
    const normalizedEmail = "test123457@gmail.com".toLowerCase();

    // Mock the credentials
    const creds = {
      email: "test1234@gmail.com",
      password: "password",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      password: "password123",
      confirm: "password123",
      points: 0
    };

    // Call the register function
    console.log("registered user");
    User.fetchUserByEmailRegister = jest.fn().mockResolvedValueOnce(undefined);
    const user = await User.register(creds);

    // Check the returned user
    expect(user).toEqual(mockUser);
  });

  test("should throw BadRequestError for duplicate email", async () => {
    // Mock the db query method to return an existing user
    const existingUser = {
      id: 1,
      email: "test123456@email.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [existingUser]
    });

    // Mock the normalized email value
    const normalizedEmail = "test123456@email.com".toLowerCase();

    // Mock the credentials
    const creds = {
      email: "test123456@email.com",
      password: "password",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    User.fetchUserByEmailRegister = jest.fn().mockResolvedValueOnce(true);

    // Call the register function and expect it to throw BadRequestError
    await expect(User.register(creds)).rejects.toThrow(
      new BadRequestError(`Duplicate email: ${creds.email}`)
    );
  });

  test("should throw BadRequestError for not correct creds", async () => {
    // Mock the db query method to return an existing user
    const existingUser = {
      id: 1,
      email: "test1@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [existingUser]
    });

    // Mock the normalized email value
    const normalizedEmail = "test1@gmail.com".toLowerCase();

    // Mock the credentials
    const creds = {
      email: "test1@gmail.com",
      password: ""
    };

    // Call the register function and expect it to throw BadRequestError
    await expect(User.register(creds)).rejects.toThrow(
      new BadRequestError(`Password must be at least 8 characters`)
    );
  });

  test("should throw BadRequestError for invalid email", async () => {
    // Mock the credentials
    const creds = {
      email: "invalidemail",
      password: "password",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };

    // Call the register function and expect it to throw BadRequestError
    await expect(User.register(creds)).rejects.toThrow(
      new BadRequestError("Invalid email")
    );
  });

  test("should throw BadRequestError for invalid password", async () => {
    // Mock the credentials
    const creds = {
      email: "test1@email.com",
      password: "pass",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };

    // Call the register function and expect it to throw BadRequestError
    await expect(User.register(creds)).rejects.toThrow(
      new BadRequestError("Password must be at least 8 characters")
    );
  });

  test("should throw BadRequestError for invalid username", async () => {
    // Mock the credentials
    const creds = {
      email: "test2@gmail.com",
      password: "password",
      firstname: "test",
      lastname: "Test",
      username: "te",
      points: 0
    };

    // Call the register function and expect it to throw BadRequestError
    await expect(User.register(creds)).rejects.toThrow(
      new BadRequestError("Username must be at least 3 characters")
    );
  });

  test("should log in user", async () => {
    // Mock the db query method to return a mock user
    const mockUser = {
      id: 1,
      email: "test1@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Mock the bcrypt compare method to return true
    bcrypt.compare = jest.fn().mockResolvedValueOnce(true);

    // Mock the normalized email value
    const normalizedEmail = "test1@gmail.com".toLowerCase();

    // Mock the credentials
    const creds = {
      email: "test1@gmail.com",
      password: "password",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };

    // Call the login function
    const user = await User.fetchUserByEmail(creds);

    // Check the returned user
    expect(user).toEqual(mockUser);
  });

  test("should fetch user by id", async () => {
    // Mock the db query method to return a mock user
    const mockUser = {
      id: 1,
      email: "test1@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Call the fetchUserById function
    const user = await User.fetchById(1);

    // Check the returned user
    expect(user).toEqual(mockUser);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test("should return token", async () => {
    // Mock the db query method to return a mock user
    const mockUser = {
      id: 1,
      email: "test1@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Mock the bcrypt compare method to return true
    bcrypt.compare = jest.fn().mockResolvedValueOnce(true);

    // Mock the normalized email value
    const normalizedEmail = "test1@gmail.com".toLowerCase();

    // Mock the credentials
    const creds = {
      email: "test1@gmail.com",
      password: "password",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };

    // Call the login function
    const user = await User.fetchUserByEmail(creds);

    // Check the returned user
    expect(user).toEqual(mockUser);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);

    // Check that token is generated
    const token = User.generateAuthToken(user);
    expect(token).toBeTruthy();
  });

  test("register should fetch user by email", async () => {
    // Mock the db query method to return a mock user
    const mockUser = {
      id: 1,
      email: "test1@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Call the fetchUserById function
    const user = await User.fetchUserByEmailRegister(mockUser.email);
    console.log(user);

    // Check the returned user
    expect(user).toEqual(mockUser);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test("should update user photo", async () => {
    // Mock the db query method to return a mock user
    const mockUser = {
      id: 1,
      email: "test1@gmail.com",
      firstname: "test",
      lastname: "Test",
      username: "testdoe",
      points: 0,
      photo: "new-photo.jpg" // Mock the new photo value
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Mock the update object
    const update = {
      email: "test1@gmail.com",
      photo: "new-photo.jpg"
    };

    // Call the updatePhoto function
    const updatedUser = await User.updatePhoto(update);

    // Check the returned user
    expect(updatedUser).toEqual(mockUser);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [
      update.email,
      update.photo
    ]);
  });

  test("should add a quiz", async () => {
    // Mock the quiz data
    const mockQuiz = {
      quiz_id: 1,
      user_id: 1,
      questions: ["Question 1", "Question 2"],
      points: 10,
      subject: "Science",
      difficulty: "Intermediate"
    };
    db.query.mockResolvedValueOnce({
      rows: [mockQuiz]
    });

    // Mock the quiz input
    const quiz = {
      userid: 1,
      questions: ["Question 1", "Question 2"],
      points: 10,
      subject: "Science",
      difficulty: "Intermediate"
    };

    // Call the addQuiz function
    const addedQuiz = await User.addQuiz(quiz);

    // Check the returned quiz
    expect(addedQuiz).toEqual(mockQuiz);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [
      quiz.userid,
      quiz.questions,
      quiz.points,
      quiz.subject,
      quiz.difficulty
    ]);
  });

  test("should list quizzes for a user", async () => {
    // Mock the quiz data
    const mockQuiz1 = {
      quiz_id: 1,
      questions: ["Question 1", "Question 2"],
      points: 10,
      subject: "Science",
      difficulty: "Intermediate"
    };
    const mockQuiz2 = {
      quiz_id: 2,
      questions: ["Question 3", "Question 4"],
      points: 15,
      subject: "Math",
      difficulty: "Advanced"
    };
    db.query.mockResolvedValueOnce({
      rows: [mockQuiz1, mockQuiz2]
    });

    // Mock the user ID
    const userId = {
      userid: 1
    };

    // Call the listQuiz function
    const quizzes = await User.listQuiz(userId);

    // Check the returned quizzes
    expect(quizzes).toEqual([mockQuiz1, mockQuiz2]);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [userId.userid]);
  });

  test("should update user points and totalquiz", async () => {
    // Mock the user data
    const mockUser = {
      points: 20
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser]
    });

    // Mock the update input
    const update = {
      email: "test1@gmail.com",
      points: 5
    };

    // Call the updateUser function
    const updatedUser = await User.updateUser(update);

    // Check the returned user
    expect(updatedUser).toEqual(mockUser);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [
      update.email,
      update.points
    ]);
  });

  test("should fetch all users", async () => {
    // Mock the user data
    const mockUser1 = {
      id: 1,
      username: "user1",
      points: 20,
      created: "2023-08-01",
      photo: "user1.jpg",
      totalquiz: 10
    };
    const mockUser2 = {
      id: 2,
      username: "user2",
      points: 15,
      created: "2023-07-15",
      photo: "user2.jpg",
      totalquiz: 8
    };
    db.query.mockResolvedValueOnce({
      rows: [mockUser1, mockUser2]
    });

    // Call the fetchAll function
    const users = await User.fetchAll();

    // Check the returned users
    expect(users).toEqual([mockUser1, mockUser2]);

    // Check that the db query method was called exactly once
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.any(String));
  });

  test("should verify a valid token", async () => {
    // Mock the token verification result
    const secretKey = "your-secret-key";
    const mockDecoded = {
      userId: 1,
      username: "testuser"
    };
    const token = jwt.sign(mockDecoded, secretKey);

    // Call the verifyAuthToken function
    const decodedToken = User.verifyAuthToken(token);

    // Check the returned decoded token
    expect(decodedToken.userId).toEqual(1);
    expect(decodedToken.username).toEqual("testuser");
  });
});
