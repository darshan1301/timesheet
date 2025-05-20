-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedBy" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
