import { Project } from 'ts-morph'

// Create a new project
const project = new Project({
  // Optional: specify tsconfig path
  // tsConfigFilePath: "tsconfig.json",
})

// Add source files (adjust the glob pattern as needed)
project.addSourceFilesAtPaths('./apps/web/src/**/*.{ts,tsx}')

// Function to remove all comments from a source file
function removeAllComments(sourceFile: any) {
  let hasComments = true

  // Keep removing comments until none are left
  while (hasComments) {
    const comments = []

    // Collect all comment ranges
    comments.push(...sourceFile.getLeadingCommentRanges())
    comments.push(...sourceFile.getTrailingCommentRanges())

    sourceFile.forEachDescendant((node: any) => {
      comments.push(...node.getLeadingCommentRanges())
      comments.push(...node.getTrailingCommentRanges())
    })

    if (comments.length === 0) {
      hasComments = false
      break
    }

    // Sort by position (from end to beginning) and remove duplicates
    const uniqueComments = Array.from(
      new Map(comments.map(c => [`${c.getPos()}-${c.getEnd()}`, c])).values()
    ).sort((a, b) => b.getPos() - a.getPos())

    // Remove one comment at a time (starting from the end)
    const comment = uniqueComments[0]
    if (comment) {
      const _commentText = sourceFile
        .getFullText()
        .substring(comment.getPos(), comment.getEnd())

      // Optional: preserve certain comments
      // if (commentText.includes('@preserve') || commentText.includes('/*!')) {
      //   // Remove this comment from the array and continue
      //   continue;
      // }

      sourceFile.removeText(comment.getPos(), comment.getEnd())
    }
  }
}

// Process all source files
const sourceFiles = project.getSourceFiles()

sourceFiles.forEach(sourceFile => {
  console.log(`Processing: ${sourceFile.getFilePath()}`)
  removeAllComments(sourceFile)
})

async function main() {
  // Process all source files
  const sourceFiles = project.getSourceFiles()

  sourceFiles.forEach(sourceFile => {
    console.log(`Processing: ${sourceFile.getFilePath()}`)
    removeAllComments(sourceFile)
  })

  // Save all changes
  await project.save()

  console.log(`Processed ${sourceFiles.length} files. All comments removed!`)
}

// Run the main function
main().catch(console.error)
