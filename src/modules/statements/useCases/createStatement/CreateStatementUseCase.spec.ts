import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../../entities/Statement";
import { User } from "../../../users/entities/User";

describe("create statement use-case", () => {
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let createStatementUseCase: CreateStatementUseCase;
  let mockedUser: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    mockedUser = await usersRepository.create({
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    });
    await statementsRepository.create({
      user_id: mockedUser.id!,
      amount: 100,
      description: "any description",
      type: OperationType.DEPOSIT,
    });
  });

  it("throws an error if user does not exist", () => {
    const input = {
      user_id: "not.a.user",
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "any description",
    };
    const promise = createStatementUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("throws an error when withdrawal exceeds user's balance", () => {
    const input = {
      user_id: mockedUser.id!,
      type: OperationType.WITHDRAW,
      amount: 1000000,
      description: "any description",
    };
    const promise = createStatementUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(
      CreateStatementError.InsufficientFunds
    );
  });

  it("processes statement deposit correctly", async () => {
    const input = {
      user_id: mockedUser.id!,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "any description",
    };
    const output = await createStatementUseCase.execute(input);

    expect(output).toEqual(expect.objectContaining(input));
  });

  it("processes statement withdrawal correctly", async () => {
    const input = {
      user_id: mockedUser.id!,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "any description",
    };
    const output = await createStatementUseCase.execute(input);

    expect(output).toEqual(expect.objectContaining(input));
  });
});
