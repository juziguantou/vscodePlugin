const vscode = require('vscode')
const fs = require("fs");
const path = require('path');

exports.activate = function(context) {
    console.log('恭喜 demo被激活了');
    let disposable = vscode.commands.registerCommand('create.ui_module', async (uri) =>{
        console.log('aa1 ' + uri);
        const fileName = await vscode.window.showInputBox({
            prompt: '输入功能名(例如HomeBuildGroup)'
        });
        if (fileName) {
            let UIName = `${fileName}UI`
            let ModuleName = `${fileName}Module`
            let fsPath = uri.fsPath
            const UIFilePath = `${fsPath}\\${UIName}.lua`;
            const ModuleFilePath = `${fsPath}\\${ModuleName}.lua`;
            console.log('aa4 ' + UIFilePath);
            // 检查文件是否已存在
            if (fs.existsSync(UIFilePath)) {
                vscode.window.showErrorMessage("UI文件已存在");
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
                console.log('aa5 \n' + UIContentText);
                fs.writeFile(UIFilePath, UIContentText, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage('创建UI文件失败: ' + err.message);
                    } else {
                        vscode.window.showInformationMessage('UI文件创建成功: ' + filePath);
                    }
                });
            }
            if (fs.existsSync(ModuleFilePath)) {
                vscode.window.showErrorMessage("Module文件已存在");
            }
            else{
                let ModuleContentText =
`local CommonSubModuleBase = require("client.ingame.common.common_submodule_base")
local ${ModuleName} = CommonSubModuleBase:New()

${ModuleName}.UIName = "HomePersonUI"

function ${ModuleName}:OnReceivePostLoad()
    print_dev("${ModuleName}:OnReceivePostLoad")
end

function ${ModuleName}:OnReceivePreUnload()
    print_dev("${ModuleName}:OnReceivePreUnload")
end

function ${ModuleName}:OnCreatedUI(UIMeta)
    if UIMeta and UIMeta.UIName == ${ModuleName}.UIName then
        UIMeta.UI:SetBuildingState(self.IsBuildPermissions)
    end
end

function ${ModuleName}:ShowUI()
    print_dev("${ModuleName}:ShowUI")
    local MainModule = self:GetOwnerModule()
    if MainModule then
        MainModule:ShowUI(self.UIName)
    end
end

function ${ModuleName}:HideUI()
    print_dev("${ModuleName}:HideUI")
    local MainModule = self:GetOwnerModule()
    if MainModule then
        MainModule:HideUI(self.UIName)
    end
end

return ${ModuleName}`
                console.log('aa6 \n' + ModuleContentText);
                fs.writeFile(ModuleFilePath, ModuleContentText, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage('创建Module文件失败: ' + err.message);
                    } else {
                        vscode.window.showInformationMessage('Module文件创建成功: ' + filePath);
                    }
                });
            }
        }
    });
    context.subscriptions.push(disposable);
    let disposable2 = vscode.commands.registerCommand('create.click_event', function(){
        let editor = vscode.window.activeTextEditor; //获取活动的编辑器窗口
        //获取编辑器编辑区
        if (!editor) { return; }
        let selection = editor.selection; //获取当前的选择内容
        const document = editor.document //获取TextDocument
        let text = document.getText(selection);//获取当前的选择的文本
        const logToInsert = `console.log('${text}: ',${text});\n`;
		// 获取光标当前行(number)
		const lineOfSelectedVar = selection.active.line;
        //selection.start获取选择的开始位置(Position)
        let startline = selection.start.line;
        let endline = selection.end.line;
        console.log('aa1' + startline);

        let AllText = document.getText();//获取所有的文本
        const ReturnIdx = AllText.lastIndexOf("return")
        console.log('aa1.1 ' + ReturnIdx);
        let UINameText = AllText.slice(ReturnIdx + 6, AllText.length)//获取UI的名字
        UINameText = UINameText.replace(/\s/g, "")//去掉空白字符
        console.log('aa1.2 ' + UINameText);
        const UnRegisterEventsIdx = AllText.indexOf("function " + UINameText + ":UnRegisterEvents")//获取反注册函数的偏移量
        if (UnRegisterEventsIdx == -1){
            vscode.window.showErrorMessage('没有找到UnRegisterEvents方法')
            return
        }
        const UnRegisterEventsLineEndIdx = AllText.indexOf("\n", UnRegisterEventsIdx)//获取反注册函数这行结束的偏移量
        console.log('aa1.3 ' + startline);
        const UnRegisterEventsLineEndPosition = document.positionAt(UnRegisterEventsLineEndIdx + 1)//根据偏移量获取位置(下一行)

        console.log('aa1.4 ' + startline);
        let ReturnPosition = document.positionAt(ReturnIdx)
        ReturnPosition.character = 0//这一行的开始位置
        //const ReturnTextLine = document.lineAt(ReturnPosition)//根据位置获取当前文本行

        let RegisterStr = "";
        let UnRegister = "";
        let FuntionStr = "";
        console.log('aa2' + endline);
        let lastLineCharCnt = 0; //最后一行字符数
        for (let i = startline; i <= endline; i++) {
            const line = document.lineAt(i);
            let lineText = line.text;
            const linelength = lineText.length
            const BeginIdx = lineText.search(/\S/);//查找第一个不是空白符的位置
            console.log('aa2.1 ' + BeginIdx);
            const BeginText = lineText.slice(0, BeginIdx)//把前面的空白字符串记录下来
            //let Text = lineText.slice(BeginIdx, linelength)//第一个
            let Text = lineText.replace(/\s/g, "")//提取有效部分，去掉所有空白字符
            console.log('aa2.3 ' + Text);
            let OnClickedFuntionText = "OnClicked_" + Text
            //let lineText = line.text.replace(/[\s\t]/g, "");
            if (i == endline){
                console.log('aa2.4');
                lastLineCharCnt = linelength
                RegisterStr = RegisterStr + BeginText + "self." + Text + '.OnClicked:Add(self.' + OnClickedFuntionText + ', self)'
                UnRegister = UnRegister + BeginText + "self." + Text + '.OnClicked:Remove(self.' + OnClickedFuntionText + ', self)\n'
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
            else{
                console.log('aa2.5');
                RegisterStr = RegisterStr + BeginText +"self." +  Text + '.OnClicked:Add(self.' + OnClickedFuntionText + ', self)' + "\n"
                UnRegister = UnRegister + BeginText + "self." + Text + '.OnClicked:Remove(self.' + OnClickedFuntionText + ', self)' + "\n"
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
        }
    
    
        console.log('aa6 ' + lastLineCharCnt);
        //let Text2 = editor.document.getText(textRange)
        console.log(RegisterStr);
        console.log('aa7');
        //const a = new vscode.Range(selection.start, selection.end)
        console.log('aa7.1');
        //获取当前行的范围(Range)
        //const currentLineRange = editor.document.lineAt(selection.active.line).range;
        //创建一个Range,selection.end.character(结束行的字符串)
        let selecLineRange = new vscode.Range(startline, 0, endline, lastLineCharCnt)
        console.log('aa8');
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
        console.log('aa9');
    });
    context.subscriptions.push(disposable2);
    let disposable3 = vscode.commands.registerCommand('create.event', function(){
        let editor = vscode.window.activeTextEditor; //获取活动的编辑器窗口
        if (!editor) { return; }
        let selection = editor.selection; //获取当前的选择内容
        const document = editor.document //获取TextDocument
        let text = document.getText(selection);//获取当前的选择的文本
        const logToInsert = `console.log('${text}: ',${text});\n`;
		// 获取光标当前行(number)
		const lineOfSelectedVar = selection.active.line;
        //selection.start获取选择的开始位置(Position)
        let startline = selection.start.line;
        let endline = selection.end.line;
        console.log('aa1' + startline);

        let AllText = document.getText();//获取所有的文本
        const ReturnIdx = AllText.lastIndexOf("return")
        console.log('aa1.1 ' + ReturnIdx);
        let UINameText = AllText.slice(ReturnIdx + 6, AllText.length)//获取UI的名字
        UINameText = UINameText.replace(/\s/g, "")//去掉空白字符
        console.log('aa1.2 ' + UINameText);
        const UnRegisterEventsIdx = AllText.indexOf("function " + UINameText + ":UnRegisterEvents")//获取反注册函数的偏移量
        if (UnRegisterEventsIdx == -1){
            vscode.window.showErrorMessage('没有找到UnRegisterEvents方法')
            return
        }
        const UnRegisterEventsLineEndIdx = AllText.indexOf("\n", UnRegisterEventsIdx)//获取反注册函数这行结束的偏移量
        console.log('aa1.3 ' + startline);
        const UnRegisterEventsLineEndPosition = document.positionAt(UnRegisterEventsLineEndIdx + 1)//根据偏移量获取位置(下一行)

        console.log('aa1.4 ' + startline);
        let ReturnPosition = document.positionAt(ReturnIdx)
        ReturnPosition.character = 0//这一行的开始位置
        //const ReturnTextLine = document.lineAt(ReturnPosition)//根据位置获取当前文本行

        let RegisterStr = "";
        let UnRegister = "";
        let FuntionStr = "";
        console.log('aa2' + endline);
        let lastLineCharCnt = 0; //最后一行字符数
        for (let i = startline; i <= endline; i++) {
            const line = document.lineAt(i);
            let lineText = line.text;
            const linelength = lineText.length
            const BeginIdx = lineText.search(/\S/);//查找第一个不是空白符的位置
            console.log('aa2.1 ' + BeginIdx);
            const BeginText = lineText.slice(0, BeginIdx)//把前面的空白字符串记录下来
            let Text = lineText.replace(/\s/g, '')//提取有效部分，去掉所有空白字符
            console.log('aa2.3 ' + Text);
            const Texts = Text.split(".")//分割成两个
            if (Texts.length != 2) {
                vscode.window.showErrorMessage('字符串格式不对：'+Text)
                return
            }
            let UIName = Texts[0];
            let EventName = Texts[1];
            let OnClickedFuntionText = EventName + "_" + UIName
            if (i == endline){
                console.log('aa2.4');
                lastLineCharCnt = linelength
                RegisterStr = RegisterStr + BeginText + "self." + UIName + '.' + EventName + ':Add(self.' + OnClickedFuntionText + ', self)'
                UnRegister = UnRegister + BeginText + "self." + UIName + '.' + EventName + ':Remove(self.' + OnClickedFuntionText + ', self)\n'
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
            else{
                console.log('aa2.5');
                RegisterStr = RegisterStr + BeginText +"self." +  UIName + '.' + EventName + ':Add(self.' + OnClickedFuntionText + ', self)' + "\n"
                UnRegister = UnRegister + BeginText + "self." + UIName + '.' + EventName + ':Remove(self.' + OnClickedFuntionText + ', self)' + "\n"
                FuntionStr = FuntionStr + 'function ' + UINameText + ':' + OnClickedFuntionText + '()\n    print_dev("' + UINameText + ':' + OnClickedFuntionText + '")\nend\n\n'
            }
        }
    
    
        console.log('aa6 ' + lastLineCharCnt);
        //let Text2 = editor.document.getText(textRange)
        console.log(RegisterStr);
        console.log('aa7');
        //const a = new vscode.Range(selection.start, selection.end)
        console.log('aa7.1');
        //获取当前行的范围(Range)
        //const currentLineRange = editor.document.lineAt(selection.active.line).range;
        //创建一个Range,selection.end.character(结束行的字符串)
        let selecLineRange = new vscode.Range(startline, 0, endline, lastLineCharCnt)
        console.log('aa8');
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
        console.log('aa9');
    });
    context.subscriptions.push(disposable3);

    const copyFile = vscode.commands.registerCommand('extension.copyFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('当前没有活动窗口');
            return;
        }
        
        const sourcePath = activeEditor.document.uri.fsPath;
        console.log('aa1 '+sourcePath);
        const directory = sourcePath.substr(0, sourcePath.lastIndexOf("\\"))
        console.log('aa2 '+directory);
        let LuaIdx = directory.indexOf("Lua")
        if (LuaIdx == -1){
            LuaIdx = directory.indexOf("lua")
            if (LuaIdx == -1){
                vscode.window.showErrorMessage('找不到lua目录');
                return
            }
        }
        let luaLaterStr = directory.substr(LuaIdx); //从lua开始到最后的目录字符串
        console.log('aa4 '+luaLaterStr);
        const SurviveIdx = directory.indexOf("Survive")
        if (SurviveIdx == -1){
            vscode.window.showErrorMessage('找不到Survive目录');
            return
        }
        console.log('aa5 '+"Survive\\Source\\" + luaLaterStr);
        const targetDirectory = directory.replace("Survive\\Source\\" + luaLaterStr, "Survive_Pak\\WinClient\\WindowsNoEditor\\ShadowTrackerExtra\\Content\\" + luaLaterStr)
        // const targetDirectory = 'C:\\your\\target\\directory'; // 替换为您的目标目录
        console.log('aa6 '+targetDirectory);
        
        try {
            console.log('aa7 ');
            if (!fs.existsSync(targetDirectory)) {//如果目录不存在，则创建目录
                console.log('aa8 ');
                fs.mkdirSync(targetDirectory, { recursive: true });
            }
            console.log('aa9 ');
            await fs.promises.copyFile(sourcePath, path.join(targetDirectory, path.basename(sourcePath)));
            console.log('aa10 ');
            vscode.window.showInformationMessage('File copied successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error copying file: ${error.message}`);
        }
    });
    
    context.subscriptions.push(copyFile);
    console.log('恭喜 demo激活完成');
}
