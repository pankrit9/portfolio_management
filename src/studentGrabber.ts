import * as mongoDB from "mongodb";

export async function grabStudent(stuKey: any, coll: mongoDB.Collection): Promise<mongoDB.WithId<mongoDB.Document>|null>{
    console.log("here");
    const cursor = await coll.findOne({"publicKey":stuKey});
    console.log(cursor);
    return cursor;
}
