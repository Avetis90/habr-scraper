const puppeteer = require("puppeteer");
const Company = require('./models/Company')
const emailScraper = require('./emailScraper')

module.exports = async (options) => {

    if (!parseInt(options.start) && !parseInt(options.end)) {
        return
    }
    // Extract partners on the page, recursively check the next page in the URL pattern
    const extractPartners = async url => {

        // Scrape the data we want
        const page = await browser.newPage();
        await page.exposeFunction('emailScraper', emailScraper);
        await page.setDefaultNavigationTimeout(0)
        await page.goto(url, {waitUntil: 'networkidle2'}).catch(e => void 0);
        const partnersOnPage = await page.evaluate(() => {
                const result = Array.from(document.querySelectorAll("div.companies-item"));
                const data = result.map(compact => {
                    const title = compact.querySelector("a.title").innerText.trim();
                    const link = compact.querySelector("a.title").href;
                    //const email =  'asd'
                    return {
                        title,
                        link,
                        //email
                    }
                });
                const list = emailScraper(data)
                return list

            }
        );
        //console.log(partnersOnPage)
        await page.close();

        // Recursively scrape the next page
        if (partnersOnPage.length < 1) {
            // Terminate if no partners exist
            return partnersOnPage
        } else {
            // Go fetch the next page ?page=X+1
            const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
            console.log('nextPageNumber', nextPageNumber)
            if (nextPageNumber > parseInt(options.end)) {
                return partnersOnPage
            }
            const nextUrl = `https://career.habr.com/companies?category_root_id=258822&page=${nextPageNumber}`;

            return partnersOnPage.concat(await extractPartners(nextUrl))
        }
    };

    const browser = await puppeteer.launch();
    const firstUrl =
        `https://career.habr.com/companies?category_root_id=258822&page=${parseInt(options.start)}`;
    const partners = await extractPartners(firstUrl);


    // Todo: Update database with partners
    //console.log(partners);
    /*const email = await getEmails('https://career.habr.com/companies/napoleonit')
    console.log(email,'email')*/

    const c = await Company.insertMany(partners).then(res => console.log('insertMany')).catch(err => console.log(err))
    console.log(c, 'created')

    await browser.close();

    return c
};
