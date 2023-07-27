const bcrypt = require("bcrypt");
const User = require("../models/user");
const { BadRequestError } = require("../errors");
const db = require("../db"); // Assuming you have a database connection

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
      new BadRequestError(`item is not a function`)
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
});
