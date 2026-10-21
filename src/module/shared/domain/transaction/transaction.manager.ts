import { PrismaTx } from "../transaction.types";

export abstract class TransactionManager {

  abstract run<T>(
    fn: (tx: PrismaTx) => Promise<T>,
  ): Promise<T>;
}