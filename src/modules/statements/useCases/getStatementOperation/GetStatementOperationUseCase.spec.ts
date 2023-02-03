import "reflect-metadata";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { User } from "../../../users/entities/User";

describe("get user's balance use-case", () => {
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let mockedStatement: Statement
  let mockedUser: User

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository,
    );

    mockedUser = await usersRepository.create({
      name: "John Doe",
      email: "john.doe@email.com",
      password: "Qwerty@123",
    });
    mockedStatement=await statementsRepository.create({
      user_id: mockedUser.id!,
      amount: 1000,
      description: "any description",
      type: OperationType.DEPOSIT,
    })
  });

  it("throws an error if user does not exist", () => {
    const input = {
      user_id: "not.a.user",
      statement_id: mockedStatement.id!
    };
    const promise = getStatementOperationUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("throws an error if statement is not found", () => {
    const input = {
      user_id: mockedUser.id!,
      statement_id: "not.a.user",
    };
    const promise = getStatementOperationUseCase.execute(input);

    expect(promise).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("returns the expected statement", async () => {
    const input = {
      user_id: mockedUser.id!,
      statement_id: mockedStatement.id!
    };
    const output = await getStatementOperationUseCase.execute(input);

    expect(output).toEqual(mockedStatement);
  });
});
