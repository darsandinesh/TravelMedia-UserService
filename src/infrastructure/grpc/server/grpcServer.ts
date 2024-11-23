import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path'
import config from '../../config/config';
import { userController } from '../../../interface/controller/userController';

const USER_PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
})

const userProtoDescription = grpc.loadPackageDefinition(userPackageDefinition) as any;

const userProto = userProtoDescription.user;

const server = new grpc.Server();

server.addService(userProto.UserService.service, {
    login: userController.loginUser.bind(userController),
    register:userController.grpcregisterUser.bind(userController),
})

const startgrpcServer = () => {
    const grpcPort = config.grpcPort 
    server.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error("Failed to start gRPC server:", err);
        } else {
            console.error("started gRPC server:", bindPort);
        }
    })
}

startgrpcServer()

export { startgrpcServer }