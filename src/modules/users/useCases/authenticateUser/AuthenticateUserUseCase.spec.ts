import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

jest.mock("../../../../config/auth", () => ({
  jwt: {
    secret: "super-strong-secret",
    expiresIn: '1d',
  },
}));

describe("authenticate User use-case", () => {
  let usersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let authenticateUseCase: AuthenticateUserUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUseCase = new AuthenticateUserUseCase(usersRepository);

    await createUserUseCase.execute({
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    });
  });

  it("fails to authenticate with erroneous email", () => {
    const input = {
      email: "foo@email.com",
      password: "Qwerty@123",
    };
    const promise = authenticateUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("fails to authenticate with erroneous password", () => {
    const input = {
      email: "john.doe@email.com",
      password: "123456789",
    };
    const promise = authenticateUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("authenticates correctly", async () => {
    const input = {
      email: "john.doe@email.com",
      password: "Qwerty@123",
    };
    const output = await authenticateUseCase.execute(input);

    expect(output).toHaveProperty("user");
    expect(output).toHaveProperty("token");
  });
});
