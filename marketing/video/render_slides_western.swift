import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let outDir = root.appendingPathComponent("marketing/video/western-slides", isDirectory: true)
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let canvas = NSSize(width: 1080, height: 1920)
let heroRect = NSRect(x: 54, y: 120, width: 972, height: 760)
let bodyRect = NSRect(x: 54, y: 950, width: 972, height: 780)

let bgColor = NSColor(calibratedRed: 0.02, green: 0.08, blue: 0.14, alpha: 1.0)
let panelColor = NSColor(calibratedRed: 0.05, green: 0.14, blue: 0.24, alpha: 0.95)
let accent = NSColor(calibratedRed: 0.25, green: 0.71, blue: 1.0, alpha: 1.0)
let textPrimary = NSColor.white
let textSecondary = NSColor(calibratedWhite: 0.9, alpha: 1.0)
let chipBg = NSColor(calibratedRed: 0.13, green: 0.24, blue: 0.37, alpha: 0.92)

let eyebrowFont = NSFont.systemFont(ofSize: 28, weight: .semibold)
let titleFont = NSFont.systemFont(ofSize: 68, weight: .bold)
let bodyFont = NSFont.systemFont(ofSize: 36, weight: .medium)
let chipFont = NSFont.systemFont(ofSize: 26, weight: .bold)
let footerFont = NSFont.systemFont(ofSize: 48, weight: .bold)

struct Slide {
    let filename: String
    let imagePath: String
    let eyebrow: String
    let title: String
    let subtitle: String
    let chips: [String]
}

let slides: [Slide] = [
    Slide(
        filename: "western-01.png",
        imagePath: "assets/og-whiteout-tools.png",
        eyebrow: "WHITEOUT SURVIVAL / WOS",
        title: "Still checking gift codes in random chats?",
        subtitle: "Use one mobile-friendly board instead of digging through Discord, Facebook, and old screenshots.",
        chips: ["Gift codes", "Fast copy", "Mobile-first"]
    ),
    Slide(
        filename: "western-02.png",
        imagePath: "qa-redesign-hero.png",
        eyebrow: "FROSTFIRE MINE",
        title: "Know what to do in each 30-minute phase.",
        subtitle: "Quick timing beats vague alliance callouts when you need to gather, contest, and bank points fast.",
        chips: ["Phase timer", "Reset-ready", "Alliance use"]
    ),
    Slide(
        filename: "western-03.png",
        imagePath: "qa-redesign-desktop.png",
        eyebrow: "FIRE CRYSTAL / FURNACE",
        title: "Check your FC gap before you spend.",
        subtitle: "See how many Fire Crystals and days you still need before your next jump, especially for F2P pacing.",
        chips: ["FC planner", "F2P pacing", "Search witheout20.top"]
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

func loadImage(path: String) -> NSImage? {
    NSImage(contentsOf: root.appendingPathComponent(path))
}

func drawImageCover(_ image: NSImage, in rect: NSRect) {
    guard let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return }
    let iw = CGFloat(cg.width)
    let ih = CGFloat(cg.height)
    let scale = max(rect.width / iw, rect.height / ih)
    let drawW = iw * scale
    let drawH = ih * scale
    let drawRect = NSRect(x: rect.midX - drawW / 2, y: rect.midY - drawH / 2, width: drawW, height: drawH)
    NSGraphicsContext.current?.imageInterpolation = .high
    image.draw(in: drawRect)
}

func drawChip(_ text: String, x: CGFloat, y: CGFloat) {
    let width = max(220, CGFloat(text.count) * 16 + 46)
    let rect = NSRect(x: x, y: y, width: width, height: 54)
    roundedRect(rect, radius: 18, color: chipBg)
    drawText(text, rect: NSRect(x: x + 18, y: y + 10, width: width - 36, height: 34), font: chipFont, color: textPrimary)
}

for slide in slides {
    let image = NSImage(size: canvas)
    image.lockFocus()

    bgColor.setFill()
    NSBezierPath(rect: NSRect(origin: .zero, size: canvas)).fill()

    roundedRect(heroRect, radius: 36, color: panelColor)
    roundedRect(bodyRect, radius: 36, color: panelColor)

    if let hero = loadImage(path: slide.imagePath) {
        NSGraphicsContext.saveGraphicsState()
        let clip = NSBezierPath(roundedRect: heroRect, xRadius: 36, yRadius: 36)
        clip.addClip()
        drawImageCover(hero, in: heroRect)
        NSColor(calibratedWhite: 0.0, alpha: 0.18).setFill()
        NSBezierPath(rect: heroRect).fill()
        NSGraphicsContext.restoreGraphicsState()
    }

    drawText(slide.eyebrow, rect: NSRect(x: bodyRect.minX + 28, y: bodyRect.maxY - 82, width: bodyRect.width - 56, height: 40), font: eyebrowFont, color: accent)
    drawText(slide.title, rect: NSRect(x: bodyRect.minX + 28, y: bodyRect.maxY - 262, width: bodyRect.width - 56, height: 200), font: titleFont, color: textPrimary)
    drawText(slide.subtitle, rect: NSRect(x: bodyRect.minX + 28, y: bodyRect.maxY - 430, width: bodyRect.width - 56, height: 180), font: bodyFont, color: textSecondary)

    let chipY = bodyRect.minY + 88
    var chipX = bodyRect.minX + 28
    for chip in slide.chips {
        drawChip(chip, x: chipX, y: chipY)
        chipX += max(220, CGFloat(chip.count) * 16 + 46) + 18
    }

    drawText("Search: witheout20.top", rect: NSRect(x: 0, y: 36, width: canvas.width, height: 66), font: footerFont, color: textPrimary, alignment: .center)

    image.unlockFocus()

    if let tiff = image.tiffRepresentation,
       let bitmap = NSBitmapImageRep(data: tiff),
       let data = bitmap.representation(using: .png, properties: [:]) {
        try data.write(to: outDir.appendingPathComponent(slide.filename))
        print("Wrote \(slide.filename)")
    }
}
