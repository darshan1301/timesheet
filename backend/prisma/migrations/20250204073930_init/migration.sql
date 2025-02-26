-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'HR', 'STAFF');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ONGOING', 'PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('ACCEPT', 'REJECT', 'PENDING');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dateOfJoining" TIMESTAMP(3) NOT NULL,
    "role" "role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "punchIn" TIMESTAMP(3) NOT NULL,
    "punchOut" TIMESTAMP(3),

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestForAttendance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "punchIn" TIMESTAMP(3) NOT NULL,
    "punchOut" TIMESTAMP(3),
    "reason" TEXT NOT NULL,

    CONSTRAINT "RequestForAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestForAttendance" ADD CONSTRAINT "RequestForAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
