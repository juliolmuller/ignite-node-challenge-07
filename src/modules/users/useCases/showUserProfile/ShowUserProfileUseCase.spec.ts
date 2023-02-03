import "reflect-metadata";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { User } from "../../entities/User";

describe("get user profile use-case", () => {
  let usersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("throws an error if user does not exist", () => {
    const input = 'not.a.valid.user.id'
    const promise = showUserProfileUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(ShowUserProfileError);
  });

  it("returns the data for the user", async () => {
    const mockedUser = await usersRepository.create({
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    });
    const input = mockedUser.id
    const output = await showUserProfileUseCase.execute(input!);

    expect(output).toEqual(mockedUser);
  });
});
