declare module './instructions-service.js' {
  interface Instruction {
    title: string;
    status: string;
    lastModified: string;
  }

  interface InstructionResult {
    success: boolean;
    message: string;
    sessionId: string;
    sessionUrl: string;
  }

  class InstructionsService {
    getInstructions(username: string, password: string): Promise<Instruction[]>;
    createInstruction(username: string, password: string, title: string, content: string): Promise<InstructionResult>;
    deleteInstruction(username: string, password: string, title: string): Promise<InstructionResult>;
    deleteAllInstructions(username: string, password: string): Promise<InstructionResult>;
  }

  const instructionsService: InstructionsService;
  export default instructionsService;
}
