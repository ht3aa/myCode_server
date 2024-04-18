import { DataSource } from "typeorm";

export const myDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Alhasgdkyuiodsag27183296ahgajksf",
  database: "mycode",
  entities: ["entities/*.entity.ts"],
  logging: false,
  synchronize: true,
});
