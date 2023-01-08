import { Channel } from '@sidewinder/channel'

import { Context } from "@ockam/ockam/src/worker"
import { TcpSendWorker } from "../worker/sender.mjs";

class WorkerRelay {
  worker: TcpSendWorker
  ctx: Context

  constructor(worker: TcpSendWorker, ctx: Context) {
    this.worker = worker
    this.ctx = ctx
  }
  static init(worker: TcpSendWorker, context: Context, ctrl_rx: Channel) {
    const wr = new WorkerRelay(worker, context)
    // spawn
  }
}
