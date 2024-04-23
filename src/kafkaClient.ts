import { EachMessagePayload, Kafka } from "kafkajs";
import {getRepository} from "typeorm";
import dotenv from 'dotenv';

import { User } from "./entity/user.entity";

dotenv.config();

const kafka = new Kafka({
  clientId: 'email-consumer',
  brokers: [process.env.KAFKA_BROKER],
  ssl: true,
  sasl: {
      mechanism: 'plain',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_SECRET
  }
});

const consumer = kafka.consumer({ groupId: 'email-consumer' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'newUser' });;
  await consumer.run({
      eachMessage: async (message: EachMessagePayload) => {
        if (message.topic === 'newUser') {
          const userData = JSON.parse(message.message.value.toString());
          const { id, first_name, last_name, email, is_ambassador, password, } = userData;
          await getRepository(User).save({
            id, first_name, last_name, email, is_ambassador, password,
          });
        } else if (message.topic === 'updateUser') {
          const emailData = JSON.parse(message.message.value.toString());
          const { id, email } = emailData;
          await getRepository(User).update(id, { email });
        }
      }
  })

}

export default run;
