import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let outDir = root.appendingPathComponent("marketing/video/slides", isDirectory: true)
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let canvas = NSSize(width: 1080, height: 1920)
let cardRect = NSRect(x: 54, y: 120, width: 972, height: 720)
let footerRect = NSRect(x: 54, y: 1020, width: 972, height: 610)

let bgColor = NSColor(calibratedRed: 0.03, green: 0.09, blue: 0.16, alpha: 1.0)
let panelColor = NSColor(calibratedRed: 0.06, green: 0.14, blue: 0.24, alpha: 0.92)
let accent = NSColor(calibratedRed: 0.21, green: 0.63, blue: 1.0, alpha: 1.0)
let textPrimary = NSColor.white
let textSecondary = NSColor(calibratedWhite: 0.88, alpha: 1.0)

let titleFont = NSFont.systemFont(ofSize: 64, weight: .bold)
let bodyFont = NSFont.systemFont(ofSize: 34, weight: .medium)
let smallFont = NSFont.systemFont(ofSize: 28, weight: .medium)
let footerFont = NSFont.systemFont(ofSize: 44, weight: .bold)

struct Slide {
    let filename: String
    let imagePath: String
    let eyebrow: String
    let title: String
    let bullets: [String]
}

let slides: [Slide] = [
    Slide(
        filename: "slide-01.png",
        imagePath: "assets/og-whiteout-tools.png",
        eyebrow: "WHITEOUT SURVIVAL TOOLS",
        title: "Still checking WOS codes in random chats?",
        bullets: [
            "Quick-copy gift codes",
            "Frostfire Mine timer",
            "Fire Crystal planner",
            "EN / 简中 / 繁中"
        ]
    ),
    Slide(
        filename: "slide-02.png",
        imagePath: "qa-redesign-hero.png",
        eyebrow: "FAST PLAYER TASKS",
        title: "Copy codes faster and stop guessing what is still active.",
        bullets: [
            "Code board built for repeat checks",
            "Cleaner than digging through comments",
            "Easy to share with alliance chat"
        ]
    ),
    Slide(
        filename: "slide-03.png",
        imagePath: "qa-redesign-desktop.png",
        eyebrow: "RETURN-VISIT TOOLS",
        title: "Time Frostfire and check your next FC jump in seconds.",
        bullets: [
            "30-minute phase timing",
            "Furnace target gap planning",
            "Useful before reset and event push"
        ]
    )
]

func roundedRect(_ rect: NSRect, radius: CGFloat, color: NSColor) {
    color.setFill()
    NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius).fill()
}

func drawText(_ text: String, rect: NSRect, font: NSFont, color: NSColor, alignment: NSTextAlignment = .left) {
    let style = NSMutableParagraphStyle()
    style.alignment = alignment
    style.lineBreakMode = .byWordWrapping
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: style
    ]
    NSString(string: text).draw(with: rect, options: [.usesLineFragmentOrigin, .usesFontLeading], attributes: attrs)
}

func drawBullet(_ text: String, index: Int) {
    let y = footerRect.maxY - 250 - CGFloat(index) * 96
    let dotRect = NSRect(x: footerRect.minX + 12, y: y + 18, width: 18, height: 18)
    accent.setFill()
    NSBezierPath(ovalIn: dotRect).fill()
    drawText(text, rect: NSRect(x: footerRect.minX + 54, y: y, width: footerRect.width - 76, height: 72), font: bodyFont, color: textSecondary)
}

func loadImage(path: String) -> NSImage? {
    let url = root.appendingPathComponent(path)
    return NSImage(contentsOf: url)
}

func drawImageCover(_ image: NSImage, in rect: NSRect) {
    guard let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return }
    let iw = CGFloat(cg.width)
    let ih = CGFloat(cg.height)
    let scale = max(rect.width / iw, rect.height / ih)
    let drawW = iw * scale
    let drawH = ih * scale
    let drawRect = NSRect(
        x: rect.midX - drawW / 2,
        y: rect.midY - drawH / 2,
        width: drawW,
        height: drawH
    )
    NSGraphicsContext.current?.imageInterpolation = .high
    image.draw(in: drawRect)
}

for slide in slides {
    let image = NSImage(size: canvas)
    image.lockFocus()

    bgColor.setFill()
    NSBezierPath(rect: NSRect(origin: .zero, size: canvas)).fill()

    roundedRect(cardRect, radius: 34, color: panelColor)
    roundedRect(footerRect, radius: 34, color: panelColor)

    if let source = loadImage(path: slide.imagePath) {
        NSGraphicsContext.saveGraphicsState()
        let clip = NSBezierPath(roundedRect: cardRect, xRadius: 34, yRadius: 34)
        clip.addClip()
        drawImageCover(source, in: cardRect)
        NSColor(calibratedWhite: 0, alpha: 0.12).setFill()
        NSBezierPath(rect: cardRect).fill()
        NSGraphicsContext.restoreGraphicsState()
    }

    drawText(slide.eyebrow, rect: NSRect(x: footerRect.minX + 24, y: footerRect.maxY - 92, width: footerRect.width - 48, height: 50), font: smallFont, color: accent)
    drawText(slide.title, rect: NSRect(x: footerRect.minX + 24, y: footerRect.maxY - 260, width: footerRect.width - 48, height: 180), font: titleFont, color: textPrimary)

    for (idx, bullet) in slide.bullets.enumerated() {
        drawBullet(bullet, index: idx)
    }

    drawText("witheout20.top", rect: NSRect(x: 0, y: 40, width: canvas.width, height: 70), font: footerFont, color: textPrimary, alignment: .center)

    image.unlockFocus()

    if let tiff = image.tiffRepresentation,
       let bitmap = NSBitmapImageRep(data: tiff),
       let data = bitmap.representation(using: .png, properties: [:]) {
        let dest = outDir.appendingPathComponent(slide.filename)
        try data.write(to: dest)
        print("Wrote \(dest.path)")
    }
}
