const puppeteer = require("puppeteer");
const Company = require('./models/Company')

module.exports = async () => {

    const getEmails = async url => {
        const partnerPage = await browser.newPage();
        await partnerPage.goto(url);
        const email = await partnerPage.evaluate(() => {
                const result = Array.from(document.querySelectorAll("div.contacts .contact"));
                const data = result.map(el => {
                    if (el.querySelector('.type').innerText.trim() === 'Email:') {
                        return el.querySelector('.value a').innerText
                    }
                })
                return data.filter(d => d != null)
            }
        );
        await partnerPage.close();
        return email
    }

    // Extract partners on the page, recursively check the next page in the URL pattern
    const extractPartners = async url => {

        // Scrape the data we want
        const page = await browser.newPage();
        await page.goto(url);
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

                return data
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
            // if (nextPageNumber === 2) {
            //     return partnersOnPage
            // }
            const nextUrl = `https://career.habr.com/companies?category_root_id=258822&page=${nextPageNumber}`;

            return partnersOnPage.concat(await extractPartners(nextUrl))
        }
    };

    const browser = await puppeteer.launch();
    const firstUrl =
        "https://career.habr.com/companies?category_root_id=258822&page=1";
    const partners = await extractPartners(firstUrl);


    // Todo: Update database with partners
    console.log(partners);
    /*const email = await getEmails('https://career.habr.com/companies/napoleonit')
    console.log(email,'email')*/

    const c = await Company.insertMany(partners).then(res => console.log(res, 'insertMany')).catch(err => console.log(err))
    console.log(c, 'created')

    await browser.close();
    return c
};
