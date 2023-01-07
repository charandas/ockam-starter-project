export class TransporttErr extends Error {
  constructor(message: string) {
    super(message)
    // name is set to the name of the class
    this.name = this.constructor.name
  }
}
