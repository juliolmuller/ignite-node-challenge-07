import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType, Statement } from "../../entities/Statement";

describe("get user's balance use-case", () => {
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let getBalanceUseCase: GetBalanceUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("throws an error if user does not exist", () => {
    const input = { user_id: "not.a.user" };
    const promise = getBalanceUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(GetBalanceError);
  });

  it("returns the expected balance for the user", async () => {
    const mockedUser = await usersRepository.create({
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    });
    const mockedStatements: Statement[] = [];
    mockedStatements.push(
      await statementsRepository.create({
        user_id: mockedUser.id!,
        amount: 1000,
        description: "any description",
        type: OperationType.DEPOSIT,
      })
    );
    mockedStatements.push(
      await statementsRepository.create({
        user_id: mockedUser.id!,
        amount: 100,
        description: "any description",
        type: OperationType.WITHDRAW,
      })
    );
    mockedStatements.push(
      await statementsRepository.create({
        user_id: mockedUser.id!,
        amount: 200,
        description: "any description",
        type: OperationType.WITHDRAW,
      })
    );
    mockedStatements.push(
      await statementsRepository.create({
        user_id: mockedUser.id!,
        amount: 300,
        description: "any description",
        type: OperationType.WITHDRAW,
      })
    );

    const input = { user_id: mockedUser.id! };
    const output = await getBalanceUseCase.execute(input);

    expect(output).toEqual({
      balance: 400,
      statement: mockedStatements,
    });
  });
});
