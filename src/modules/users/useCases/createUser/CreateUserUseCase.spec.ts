import "reflect-metadata";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

describe("Create User use-case", () => {
  let usersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    await usersRepository.create({
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    });
  });

  it("throw an error on duplicate email", () => {
    const input = {
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    };
    const promise = createUserUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(CreateUserError);
  });

  it("creates a user correctly", async () => {
    const input = {
      name: "Other John",
      email: "other.john@email.com",
      password: "Qwerty@123",
    };
    const output = await createUserUseCase.execute(input);

    expect(output).toHaveProperty("id");
    expect(output.password?.startsWith("$")).toBe(true);
    expect(output).toEqual(
      expect.objectContaining({
        name: output.name,
        email: output.email,
      })
    );
  });
});
