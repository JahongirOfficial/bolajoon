import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        const pdfPath = path.join(process.cwd(), 'public', 'book', 'bolajon-darslik.pdf');
        
        // Check if file exists
        if (!fs.existsSync(pdfPath)) {
            return NextResponse.json(
                { error: 'PDF fayl topilmadi' },
                { status: 404 }
            );
        }

        // Read the PDF file
        const pdfBuffer = fs.readFileSync(pdfPath);

        // Return PDF with proper headers
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="bolajon-darslik.pdf"',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('PDF yuklashda xato:', error);
        return NextResponse.json(
            { error: 'PDF yuklashda xatolik yuz berdi' },
            { status: 500 }
        );
    }
}
