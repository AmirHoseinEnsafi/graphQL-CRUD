import express from 'express'
import { createHandler } from  "graphql-http/lib/use/express"
import { buildSchema }   from "graphql"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const schema = buildSchema(`
    type User {
        id : Int
        name : String 
        email : String 
    }

    type Error {
        message : String
    }

    type updateUser {
        user : User
        error : Error
    }

    type Query {
        user : [User]
    }

    type Mutation {
        create(name : String! , email : String! , password : String):User
        update(id : Int!  , email : String , name : String): updateUser
        delete(id : Int):updateUser
    }
`) 


var root = {
    user : async () => {
        const users = await prisma.user.findMany({
            select : {
                id : true ,
                name : true ,
                email : true ,
                password : false ,
                createAt : false
            }
        })
        return users
    },

    create : async (obj : {name : string , email : string , password : string}) => {
        return await prisma.user.create({
            data : {
                name : obj.name ,
                email : obj.email ,
                password : obj.password
            },
            select : {
                id : true ,
                name : true ,
                email : true ,
                password : false ,
                createAt : false
            }
        })
    },

    update : async (obj : {id : number , email : string , name : string}) => {
        const user = await prisma.user.findFirst({
            where : {id : obj.id}
        })
        
        let a : {user  ?: {id : number , name : string , email : string } , error ?: {message : string}} = {}
        if(user){
            const userUpdated =  await prisma.user.update({
                where : {id : obj.id},
                data : {
                    name : obj.name ?? user.name ,
                    email : obj.email ?? user.email 
                },
                select : {
                    id : true ,
                    name : true ,
                    email : true ,
                    password : false ,
                    createAt : false
                }
            })
            console.log(`happening`)
            console.log(userUpdated)
            a.user = userUpdated
            return a
        }else{
            a.error = {message : "problem"}
            return a
        }
    },

    delete : async (obj : {id : number}) => {
        let result : {user ?: {id : number , name : string , email : string} , error ?: {message : string}} = {}
        const user =  await prisma.user.delete({
            where : {id : obj.id},
            select : {
                id : true ,
                name : true ,
                email : true ,
                password : false ,
                createAt : false
            }
        })

        if(user){
            result.user = {
                id : user.id ,
                name : user.name ,
                email : user.email 
            }
        }else {
            result.error = {message : "the givin id is undefined"}
        }
        return result
    }
}

const app = express()

app.all(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: root,
        context : {}
    })
)

app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")