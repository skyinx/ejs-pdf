const ejs = require("ejs");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000; // Use environment variable for port or default to 3000

// Set views directory for EJS templates
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Set static assets directory
app.use(express.static(path.join(__dirname, "public")));

async function generatePdf(html, name = "file") {
  const fileName = name.toLowerCase().replaceAll("/", " ").replaceAll(" ", "_");
  const browser = await puppeteer.launch({ headless: true }); // Launch headless Chrome

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.emulateMediaType("screen");

  const pdfOptions = {
    path: `${fileName}.pdf`,
    format: "A4",
  };

  await page.pdf(pdfOptions);

  await browser.close();

  return pdfOptions.path;
}

function removeFile(name) {
  const route = path.join(__dirname, name);

  fs.stat(route, async function (err, stats) {
    if (err) {
      return console.error(err);
    }

    fs.unlink(route, function (err) {
      if (err) return console.log(err);
      console.log("file deleted successfully");
    });
  });
}

app.get("/", async (req, res) => {
  res.status(200).send("Server is working...");
});

// API route to generate PDF
app.post("/generate-pdf", async (req, res) => {
  try {
    const data = req?.body || {};

    const html = await ejs.renderFile(
      path.join(__dirname, "views", "need.ejs"),
      { ...data }
    );

    const pdfPath = await generatePdf(html, data.name);

    res.set("Content-Disposition", `attachment; filename="${pdfPath}"`);

    res.sendFile(path.join(__dirname, pdfPath), (err) => {
      console.error(err);
    });

    await removeFile(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
});

http.createServer(app).listen(port, function () {
  console.log("Server starts at " + port);
});

// const myFunc = async () => {

//   const data = {
//     price: 16828.08,
//     percentage: 100,
//     products: [
//       {
//         name: "W&D DELTA",
//         price: 295,
//         percentage: 1,
//       },
//       {
//         name: "POLY MEDIUM FOR INK",
//         price: 5320,
//         percentage: 40,
//       },
//       {
//         name: "TAP TESTED MEDIUM",
//         price: 5518.08,
//         percentage: 36,
//       },
//       {
//         name: "TOLUNE ",
//         price: 270,
//         percentage: 3,
//       },
//       {
//         name: "IPA",
//         price: 500,
//         percentage: 5,
//       },
//       {
//         name: "NBA ",
//         price: 500,
//         percentage: 5,
//       },
//     ],
//     pigments: [
//       {
//         name: "BETA BLUE",
//         price: 2400,
//         percentage: 5,
//       },
//       {
//         name: "PIG YELLOW ",
//         price: 2025,
//         percentage: 5,
//       },
//     ],
//     name: "WOW SP T/N GREEN INK",
//   };

//   try {
//     const html = await ejs.renderFile(path.join(__dirname, "views", "need.ejs"), {
//       ...data,
//     });

//     (async (html) => {
//       const browser = await puppeteer.launch();

//       const page = await browser.newPage();

//       await page.setContent(html);

//       await page.pdf({ path: "example.pdf", format: "A4" });

//       await browser.close();

//       console.log("Here's your PDF!.");
//     })(html);

//     // res.setHeader("Content-Type", "application/pdf");
//     // res.setHeader("Content-Disposition", `attachment; filename=report.pdf`);
//     // res.send(pdf);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error generating PDF");
//   }
// }

// myFunc()
