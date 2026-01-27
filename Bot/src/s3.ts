import AWS from "aws-sdk";
import fs from "fs";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadRecording(
  meetingId: string,
  filePath: string
): Promise<string> {
  const key = `${meetingId}/recording/recording.webm`;

  await s3
    .upload({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: "video/webm",
    })
    .promise();

  return `s3://${process.env.S3_BUCKET}/${key}`;
}
