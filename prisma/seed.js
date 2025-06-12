const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create default configuration if it doesn't exist
  const existingDefaultConfig = await prisma.defaultConfig.findFirst();

  if (!existingDefaultConfig) {
    const defaultConfig = await prisma.defaultConfig.create({
      data: {
        gpsTimer: "5",
        configTimer: "60",
        uploadTimer: "10",
        retryCounter: "10",
        angleThreshold: "45",
        overSpeedingThreshold: "60",
        travelStartTimer: "20",
        travelStopTimer: "20",
        movingTimer: "60",
        stopTimer: "130",
        distanceThreshold: "1000",
        heartbeatTimer: "30",
        liveStatusUpdateTimer: "30",
        baseUrl:
          "https://connectlive.commtw.com:446/twconnectlive/TrackingServices.asmx",
      },
    });

    console.log("Default configuration created:", defaultConfig);
  } else {
    console.log("Default configuration already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
