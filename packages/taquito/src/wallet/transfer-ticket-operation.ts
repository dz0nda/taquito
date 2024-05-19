import { WalletOperation, OperationStatus } from './operation';
import { Context } from '../context';
import { Observable } from 'rxjs';
import {
  BlockResponse,
  OpKind,
  OperationContentsAndResultReveal,
  OperationContentsAndResultTransaction,
} from '@taquito/rpc';
import { ObservableError } from './errors';

export class TransferTicketWalletOperation extends WalletOperation {
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    newHead$: Observable<BlockResponse>
  ) {
    super(opHash, context, newHead$);
  }

  public async revealOperation() {
    const operationResult = await this.operationResults();
    if (!operationResult) {
      throw new ObservableError('operationResult returned undefined');
    }

    return operationResult.find((x) => x.kind === OpKind.REVEAL) as
      | OperationContentsAndResultReveal
      | undefined;
  }

  public async transferTicketOperation() {
    const operationResult = await this.operationResults();
    if (!operationResult) {
      throw new ObservableError('operationResult returned undefined');
    }
    return operationResult.find((x) => x.kind === OpKind.TRANSFER_TICKET) as
      | OperationContentsAndResultTransaction
      | undefined;
  }

  public async status(): Promise<OperationStatus> {
    if (!this._included) {
      return 'pending';
    }

    const op = await this.transferTicketOperation();
    if (!op) {
      return 'unknown';
    }

    return op.metadata.operation_result.status;
  }
}
