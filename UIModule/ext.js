const vscode = require('vscode')
const fs = require("fs");
const path = require('path');

function create_ui (fileName, uri){
    let UIName = `${fileName}UI`
    let fsPath = uri.fsPath
    const UIFilePath = `${fsPath}\\${UIName}.lua`;
    // 检查文件是否已存在
    if (fs.existsSync(UIFilePath)) {
        vscode.window.showWarningMessage("UI文件已存在");
    }
    else{
        let UIContentText =
`local ${UIName} = {}

function ${UIName}:Construct()
    self.SuperClass:Construct()
    print_dev("${UIName}:Construct")
    self:RegisterEvents()
    self:InitData()
end

function ${UIName}:ReceivePreDestroy()
    self.SuperClass.ReceivePreDestroy(self)
    print_dev("${UIName}:ReceivePreDestroy")
    self:UnRegisterEvents()
end

function ${UIName}:RegisterEvents()
    print_dev("${UIName}:RegisterEvents")
end

function ${UIName}:UnRegisterEvents()
    print_dev("${UIName}:UnRegisterEvents")
end

function ${UIName}:InitData()
    print_dev("${UIName}:InitData")
end

return ${UIName}`
        fs.writeFile(UIFilePath, UIContentText, (err) => {
            if (err) {
                vscode.window.showErrorMessage('创建UI文件失败: ' + err.message);
            } else {
                vscode.window.showInformationMessage('UI文件创建成功: ' + filePath);
            }
        });
    }
}

function create_module (fileName, uri){
    let ModuleName = `${fileName}Module`
    let fsPath = uri.fsPath
    const ModuleFilePath = `${fsPath}\\${ModuleName}.lua`;
    if (fs.existsSync(ModuleFilePath)) {
        vscode.window.showWarningMessage("Module文件已存在");
    }
    else{
        let ModuleContentText =
`local CommonSubModuleBase = require("client.ingame.common.common_submodule_base")
local ${ModuleName} = CommonSubModuleBase:New()

${ModuleName}.${fileName}UIName = "${fileName}UI"

function ${ModuleName}:OnReceivePostLoad()
    print_dev("${ModuleName}:OnReceivePostLoad")
end

function ${ModuleName}:OnReceivePreUnload()
    print_dev("${ModuleName}:OnReceivePreUnload")
end

function ${ModuleName}:OnCreatedUI(UIMeta)
    if UIMeta and UIMeta.UIName == self.${fileName}UIName then
        UIMeta.UI:SetState(self.UIState)
    end
end

function ${ModuleName}:Show${ModuleName}UI()
    print_dev("${ModuleName}:ShowUI")
    local MainModule = self:GetOwnerModule()
    if MainModule then
        MainModule:ShowUI(self.${fileName}UIName)
    end
end

function ${ModuleName}:Hide${ModuleName}UI()
    print_dev("${ModuleName}:HideUI")
    local MainModule = self:GetOwnerModule()
    if MainModule then
        MainModule:HideUI(self.${fileName}UIName)
    end
end

return ${ModuleName}`
        fs.writeFile(ModuleFilePath, ModuleContentText, (err) => {
            if (err) {
                vscode.window.showErrorMessage('创建Module文件失败: ' + err.message);
            } else {
                vscode.window.showInformationMessage('Module文件创建成功: ' + filePath);
            }
        });
    }
}

exports.activate = function(context) {
    let disposable_create_ui_module = vscode.commands.registerCommand('create.ui_module', async (uri) =>{
        const fileName = await vscode.window.showInputBox({
            prompt: '输入功能名(例如HomeBuildGroup)'
        });
        if (fileName ) {
            if (fileName == ""){
              	vscode.window.showErrorMessage("功能名不能为空");
              	return
            }
            console.log('aaa1')
            await create_ui(fileName, uri)
            console.log('aaa2')
            await create_module(fileName, uri)
            console.log('aaa3')
        }
    });
    context.subscriptions.push(disposable_create_ui_module);
    let disposable_create_ui = vscode.commands.registerCommand('create.ui', async (uri) =>{
        const fileName = await vscode.window.showInputBox({
            prompt: '输入功能名(例如HomeBuildGroup)'
        });
        if (fileName ) {
            if (fileName == ""){
              	vscode.window.showErrorMessage("功能名不能为空");
              	return
            }
            create_ui(fileName, uri)
        }
    });
    context.subscriptions.push(disposable_create_ui);
    let disposable_create_module = vscode.commands.registerCommand('create.module', async (uri) =>{
        const fileName = await vscode.window.showInputBox({
            prompt: '输入功能名(例如HomeBuildGroup)'
        });
        if (fileName ) {
            if (fileName == ""){
            	vscode.window.showErrorMessage("功能名不能为空");
              	return
            }
            create_module(fileName, uri)
        }
    });
    context.subscriptions.push(disposable_create_module);
    let disposable2 = vscode.commands.registerCommand('create.click_event', function(){
        let editor = vscode.window.activeTextEditor; //获取活动的编辑器窗口
        //获取编辑器编辑区
        if (!editor) { return; }
        let selection = editor.selection; //获取当前的选择内容
        const document = editor.document //获取TextDocument
        let text = document.getText(selection);//获取当前的选择的文本
        //selection.start获取选择的开始位置(Position)
        let startline = selection.start.line;
        let endline = selection.end.line;

        let AllText = document.getText();//获取所有的文本
        const ReturnIdx = AllText.lastIndexOf("return")
        let UINameText = AllText.slice(ReturnIdx + 6, AllText.length)//获取UI的名字
        UINameText = UINameText.replace(/\s/g, "")//去掉空白字符
        const UnRegisterEventsIdx = AllText.indexOf("function " + UINameText + ":UnRegisterEvents")//获取反注册函数的偏移量
        if (UnRegisterEventsIdx == -1){
            vscode.window.showErrorMessage('没有找到UnRegisterEvents方法')
            return
        }
        const UnRegisterEventsLineEndIdx = AllText.indexOf("\n", UnRegisterEventsIdx)//获取反注册函数这行结束的偏移量
        const UnRegisterEventsLineEndPosition = document.positionAt(UnRegisterEventsLineEndIdx + 1)//根据偏移量获取位置(下一行)

        let ReturnPosition = document.positionAt(ReturnIdx)
        ReturnPosition.character = 0//这一行的开始位置
        //const ReturnTextLine = document.lineAt(ReturnPosition)//根据位置获取当前文本行

        let RegisterStr = "";
        let UnRegister = "";
        let FuntionStr = "";
        let lastLineCharCnt = 0; //最后一行字符数
        for (let i = startline; i <= endline; i++) {
            const line = document.lineAt(i);
            let lineText = line.text;
            const linelength = lineText.length
            const BeginIdx = lineText.search(/\S/);//查找第一个不是空白符的位置
            const BeginText = lineText.slice(0, BeginIdx)//把前面的空白字符串记录下来
            //let Text = lineText.slice(BeginIdx, linelength)//第一个
            let Text = lineText.replace(/\s/g, "")//提取有效部分，去掉所有空白字符
            let OnClickedFuntionText = "OnClicked_" + Text
            //let lineText = line.text.replace(/[\s\t]/g, "");
            if (i == endline){
                lastLineCharCnt = linelength
                RegisterStr = RegisterStr + BeginText + "self." + Text + '.OnClicked:Add(self.' + OnClickedFuntionText + ', self)'
                UnRegister = UnRegister + BeginText + "self." + Text + '.OnClicked:Remove(self.' + OnClickedFuntionText + ', self)\n'
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
            else{
                RegisterStr = RegisterStr + BeginText +"self." +  Text + '.OnClicked:Add(self.' + OnClickedFuntionText + ', self)' + "\n"
                UnRegister = UnRegister + BeginText + "self." + Text + '.OnClicked:Remove(self.' + OnClickedFuntionText + ', self)' + "\n"
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
        }
    
    
        //let Text2 = editor.document.getText(textRange)
        //const a = new vscode.Range(selection.start, selection.end)
        //获取当前行的范围(Range)
        //const currentLineRange = editor.document.lineAt(selection.active.line).range;
        //创建一个Range,selection.end.character(结束行的字符串)
        let selecLineRange = new vscode.Range(startline, 0, endline, lastLineCharCnt)
		//edit方法获取editBuilder(TextEditorEdit)实例，
		editor.edit((editBuilder) => {
			editBuilder.replace(//替换
				selecLineRange, //选中的所有行(被替换)
				RegisterStr //替换为新的文本
			);
            editBuilder.insert(//插入文本
				UnRegisterEventsLineEndPosition,//插入位置
				UnRegister
			);
            editBuilder.insert(
				ReturnPosition,
				FuntionStr
			);
		});
    });
    context.subscriptions.push(disposable2);
    let disposable3 = vscode.commands.registerCommand('create.event', function(){
        let editor = vscode.window.activeTextEditor; //获取活动的编辑器窗口
        if (!editor) { return; }
        let selection = editor.selection; //获取当前的选择内容
        const document = editor.document //获取TextDocument
        let text = document.getText(selection);//获取当前的选择的文本
        //selection.start获取选择的开始位置(Position)
        let startline = selection.start.line;
        let endline = selection.end.line;

        let AllText = document.getText();//获取所有的文本
        const ReturnIdx = AllText.lastIndexOf("return")
        let UINameText = AllText.slice(ReturnIdx + 6, AllText.length)//获取UI的名字
        UINameText = UINameText.replace(/\s/g, "")//去掉空白字符
        const UnRegisterEventsIdx = AllText.indexOf("function " + UINameText + ":UnRegisterEvents")//获取反注册函数的偏移量
        if (UnRegisterEventsIdx == -1){
            vscode.window.showErrorMessage('没有找到UnRegisterEvents方法')
            return
        }
        const UnRegisterEventsLineEndIdx = AllText.indexOf("\n", UnRegisterEventsIdx)//获取反注册函数这行结束的偏移量
        const UnRegisterEventsLineEndPosition = document.positionAt(UnRegisterEventsLineEndIdx + 1)//根据偏移量获取位置(下一行)

        let ReturnPosition = document.positionAt(ReturnIdx)
        ReturnPosition.character = 0//这一行的开始位置
        //const ReturnTextLine = document.lineAt(ReturnPosition)//根据位置获取当前文本行

        let RegisterStr = "";
        let UnRegister = "";
        let FuntionStr = "";
        let lastLineCharCnt = 0; //最后一行字符数
        for (let i = startline; i <= endline; i++) {
            const line = document.lineAt(i);
            let lineText = line.text;
            const linelength = lineText.length
            const BeginIdx = lineText.search(/\S/);//查找第一个不是空白符的位置
            const BeginText = lineText.slice(0, BeginIdx)//把前面的空白字符串记录下来
            let Text = lineText.replace(/\s/g, '')//提取有效部分，去掉所有空白字符
            const Texts = Text.split(".")//分割成两个
            if (Texts.length != 2) {
                vscode.window.showErrorMessage('字符串格式不对：'+Text)
                return
            }
            let UIName = Texts[0];
            let EventName = Texts[1];
            let OnClickedFuntionText = EventName + "_" + UIName
            if (i == endline){
                lastLineCharCnt = linelength
                RegisterStr = RegisterStr + BeginText + "self." + UIName + '.' + EventName + ':Add(self.' + OnClickedFuntionText + ', self)'
                UnRegister = UnRegister + BeginText + "self." + UIName + '.' + EventName + ':Remove(self.' + OnClickedFuntionText + ', self)\n'
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
            else{
                RegisterStr = RegisterStr + BeginText +"self." +  UIName + '.' + EventName + ':Add(self.' + OnClickedFuntionText + ', self)' + "\n"
                UnRegister = UnRegister + BeginText + "self." + UIName + '.' + EventName + ':Remove(self.' + OnClickedFuntionText + ', self)' + "\n"
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
        }
    
    
        //let Text2 = editor.document.getText(textRange)
        //const a = new vscode.Range(selection.start, selection.end)
        //获取当前行的范围(Range)
        //const currentLineRange = editor.document.lineAt(selection.active.line).range;
        //创建一个Range,selection.end.character(结束行的字符串)
        let selecLineRange = new vscode.Range(startline, 0, endline, lastLineCharCnt)
		//edit方法获取editBuilder(TextEditorEdit)实例，
		editor.edit((editBuilder) => {
			editBuilder.replace(//替换
				selecLineRange, //选中的所有行(被替换)
				RegisterStr //替换为新的文本
			);
            editBuilder.insert(//插入文本
				UnRegisterEventsLineEndPosition,//插入位置
				UnRegister
			);
            editBuilder.insert(
				ReturnPosition,
				FuntionStr
			);
		});
    });
    context.subscriptions.push(disposable3);

    const copyFile = vscode.commands.registerCommand('extension.copyFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('当前没有活动窗口');
            return;
        }
        
        const sourcePath = activeEditor.document.uri.fsPath;
        const directory = sourcePath.substr(0, sourcePath.lastIndexOf("\\"))
        let LuaIdx = directory.indexOf("Lua")
        if (LuaIdx == -1){
            LuaIdx = directory.indexOf("lua")
            if (LuaIdx == -1){
                vscode.window.showErrorMessage('找不到lua目录');
                return
            }
        }
        let luaLaterStr = directory.substr(LuaIdx); //从lua开始到最后的目录字符串
        const SurviveIdx = directory.indexOf("Survive")
        if (SurviveIdx == -1){
            vscode.window.showErrorMessage('找不到Survive目录');
            return
        }
        const targetDirectory = directory.replace("Survive\\Source\\" + luaLaterStr, "Survive_Pak\\WinClient\\WindowsNoEditor\\ShadowTrackerExtra\\Content\\" + luaLaterStr)
        // const targetDirectory = 'C:\\your\\target\\directory'; // 替换为您的目标目录
        
        try {
            if (!fs.existsSync(targetDirectory)) {//如果目录不存在，则创建目录
                fs.mkdirSync(targetDirectory, { recursive: true });
            }
            await fs.promises.copyFile(sourcePath, path.join(targetDirectory, path.basename(sourcePath)));
            vscode.window.showInformationMessage('File copied successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error copying file: ${error.message}`);
        }
    });
    
    context.subscriptions.push(copyFile);
}
