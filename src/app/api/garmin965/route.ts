import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

export async function GET(req: NextRequest) {
  try {
    console.log('Lanzando el navegador...');

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || '',  // Usa Chromium de lambda o lanza error si no está disponible
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();

    await page.goto('https://www.garmin.com.co/reloj-forerunner-965/p/', {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.vtex-product-price-1-x-sellingPriceValue', { timeout: 10000 });

    const title = await page.title();

    const price = await page.evaluate(() => {
      const priceElements = document.querySelectorAll(
        '.vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer span'
      );
      return Array.from(priceElements)
        .map((el) => el.textContent?.trim())
        .join('');
    });

    await browser.close();

    return NextResponse.json({ success: true, title, price });
  } catch (error) {
    let errorMessage = 'Error desconocido';

    if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json({ success: false, error: errorMessage });
  }
}
