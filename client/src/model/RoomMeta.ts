export default class RoomMeta {
  name: string;
  map!: string;
  description: any;

  constructor(
    name: string = ''
  ) {
    this.name = name;

  }
}