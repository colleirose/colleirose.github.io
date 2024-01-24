---
layout: post
title: "Finding Windows command line history in Volatility - Execution challenge CTF Writeup - Knight CTF 2024"
description: "Using the Volatility forensics software to obtain Windows command line history"
author: "Colleirose"
permalink: /execution-challenge-forensics-knight-ctf-cmd-history-in-volatility
date: 2024-01-23
last_modified_at: 2024-01-23
---

The challenge involves finding the history of commands run in the Windows command line (<code>cmd.exe</code>) based on a memory dump file. The command history will contain the flag. 

I start by using <a href="https://github.com/volatilityfoundation/volatility" rel="nooopener">Volatility</a>'s <code>windows.cmdline.CmdLine</code> to analyze the memory dump file's currently running programs and their arguments:

```
c@computer:~/Documents/volatility3$ python3 vol.py -f ~/Documents/KnightSquad-001.DMP windows.cmdline.CmdLine
Volatility 3 Framework 2.5.2
Progress:  100.00		PDB scanning finished                                
PID	Process	Args

4	System	Required memory at 0x20 is not valid (process exited?)
284	smss.exe	\SystemRoot\System32\smss.exe
452	csrss.exe	%SystemRoot%\system32\csrss.exe ObjectDirectory=\Windows SharedSection=1024,20480,768 Windows=On SubSystemType=Windows ServerDll=basesrv,1 ServerDll=winsrv:UserServerDllInitialization,3 ServerDll=winsrv:ConServerDllInitialization,2 ServerDll=sxssrv,4 ProfileControl=Off MaxRequestThreads=16
504	wininit.exe	wininit.exe
512	csrss.exe	%SystemRoot%\system32\csrss.exe ObjectDirectory=\Windows SharedSection=1024,20480,768 Windows=On SubSystemType=Windows ServerDll=basesrv,1 ServerDll=winsrv:UserServerDllInitialization,3 ServerDll=winsrv:ConServerDllInitialization,2 ServerDll=sxssrv,4 ProfileControl=Off MaxRequestThreads=16
548	winlogon.exe	winlogon.exe
604	services.exe	C:\Windows\system32\services.exe
620	lsass.exe	C:\Windows\system32\lsass.exe
628	lsm.exe	C:\Windows\system32\lsm.exe
716	svchost.exe	C:\Windows\system32\svchost.exe -k DcomLaunch
776	VBoxService.ex	C:\Windows\System32\VBoxService.exe
844	svchost.exe	C:\Windows\system32\svchost.exe -k RPCSS
916	LogonUI.exe	Required memory at 0x7fffffda020 is not valid (process exited?)
928	svchost.exe	C:\Windows\System32\svchost.exe -k LocalServiceNetworkRestricted
984	svchost.exe	C:\Windows\System32\svchost.exe -k LocalSystemNetworkRestricted
1012	svchost.exe	C:\Windows\system32\svchost.exe -k LocalService
320	svchost.exe	C:\Windows\system32\svchost.exe -k netsvcs
472	audiodg.exe	C:\Windows\system32\AUDIODG.EXE 0x2c0
1092	svchost.exe	C:\Windows\system32\svchost.exe -k NetworkService
1228	spoolsv.exe	C:\Windows\System32\spoolsv.exe
1256	svchost.exe	C:\Windows\system32\svchost.exe -k LocalServiceNoNetwork
1340	svchost.exe	C:\Windows\System32\svchost.exe -k utcsvc
1392	svchost.exe	C:\Windows\system32\svchost.exe -k LocalServiceAndNoImpersonation
1432	mfemms.exe	"C:\Program Files\Common Files\McAfee\SystemCore\mfemms.exe"
1512	ModuleCoreServ	"C:\Program Files\Common Files\McAfee\ModuleCore\ModuleCoreService.exe"
1548	MMSSHOST.exe	"C:\Program Files\Common Files\McAfee\MMSSHost\MMSSHOST.EXE" MMSCOM mcbootdelaystartsvc
1556	mfevtps.exe	"C:\Windows\system32\mfevtps.exe" -mms
1564	ProtectedModul	"C:\\Program Files\\Common Files\\McAfee\ModuleCore\\ProtectedModuleHost.exe"
1764	PEFService.exe	"C:\Program Files\Common Files\McAfee\PEF\CORE\PEFService.exe"
1308	taskeng.exe	taskeng.exe {61151854-E908-4011-8369-0BF6E7F82026}
2040	MfeAVSvc.exe	"C:\Program Files\McAfee\MfeAV\MFEAvSvc.exe"
2320	ModuleCoreServ	ModuleCoreService.exe /startSystemModeHosting=0_1_TIME_TO_DIE /sessionId=0 /groupId=1
2348	conhost.exe	\??\C:\Windows\system32\conhost.exe "-1209142271685361894-531425533-402668515-715241983-586801334-1893083562-2146092597
2660	McCSPServiceHo	"C:\Program Files\Common Files\McAfee\CSP\4.1.106.0\\McCSPServiceHost.exe"
2720	mcshield.exe	"C:\Program Files\Common Files\McAfee\AMCore\mcshield.exe"
2792	WmiPrvSE.exe	C:\Windows\system32\wbem\wmiprvse.exe
3040	mcapexe.exe	"C:\Program Files\Common Files\McAfee\VSCore_20_12\McApExe.exe"
1208	dllhost.exe	Required memory at 0x7fffffda020 is not valid (process exited?)
3104	taskhost.exe	"taskhost.exe"
3128	slui.exe	Required memory at 0x7fffffdc020 is not valid (process exited?)
3212	sppsvc.exe	C:\Windows\system32\sppsvc.exe
3460	userinit.exe	Required memory at 0x7fffffde020 is not valid (process exited?)
3472	dwm.exe	"C:\Windows\system32\Dwm.exe"
3496	explorer.exe	C:\Windows\Explorer.EXE
3576	VBoxTray.exe	"C:\Windows\System32\VBoxTray.exe" 
3772	SearchIndexer.	C:\Windows\system32\SearchIndexer.exe /Embedding
3896	wmpnetwk.exe	"C:\Program Files\Windows Media Player\wmpnetwk.exe"
3992	SearchProtocol	"C:\Windows\system32\SearchProtocolHost.exe" Global\UsGthrFltPipeMssGthrPipe_S-1-5-21-3042789274-2628191860-436916936-10011_ Global\UsGthrCtrlFltPipeMssGthrPipe_S-1-5-21-3042789274-2628191860-436916936-10011 1 -2147483646 "Software\Microsoft\Windows Search" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT; MS Search 4.0 Robot)" "C:\ProgramData\Microsoft\Search\Data\Temp\usgthrsvc" "DownLevelDaemon"  "1"
4024	SearchFilterHo	"C:\Windows\system32\SearchFilterHost.exe" 0 508 512 520 65536 516 
3396	WmiPrvSE.exe	C:\Windows\system32\wbem\wmiprvse.exe
3492	svchost.exe	C:\Windows\System32\svchost.exe -k LocalServicePeerNet
4260	dllhost.exe	Required memory at 0x7fffffd8020 is not valid (process exited?)
4268	notepad.exe	Required memory at 0x7fffffda020 is not valid (process exited?)
4868	taskeng.exe	taskeng.exe {BC5A1055-EEE7-4735-98F8-8B0CA5D54E41}
4880	ModuleCoreServ	ModuleCoreService.exe /startUserModeHosting=1_1_TIME_TO_DIE /sessionId=1 /groupId=1
4888	conhost.exe	\??\C:\Windows\system32\conhost.exe "-943315145667469034-835458599-11439838731992957646818159495-191605888-1892123205
5028	McUICnt.exe	"C:\Program Files\Common Files\McAfee\Platform\McUICnt.exe" /platui /runkey
2656	cmd.exe	"C:\Windows\system32\cmd.exe" 
4580	conhost.exe	\??\C:\Windows\system32\conhost.exe "1094193548945927055-9018413218307182252079099763-884703563-73234193-284509992
4548	taskhost.exe	taskhost.exe $(Arg0)
4680	dllhost.exe	C:\Windows\system32\DllHost.exe /Processid:{E10F6C3A-F1AE-4ADC-AA9D-2FE65525666E}
4352	dllhost.exe	C:\Windows\system32\DllHost.exe /Processid:{E10F6C3A-F1AE-4ADC-AA9D-2FE65525666E}
3044	notmyfault64.e	"C:\Users\siam\Desktop\NotMyFault\notmyfault64.exe"  /crash
```

I then dumped the memory of the <a href="https://www.lifewire.com/conhost-exe-4158039" rel="noopener">conhost process</a> (pid 4888) by running <code>python3 vol.py -f ~/Documents/KnightSquad-001.DMP -o ~/Downloads windows.memmap.Memmap --pid 4888 --dump</code>

Then I ran <code>strings ./pid.4888.dmp | grep KCTF -C 5</code> and the outcome looked as follows:

<img src="/assets/img/execution-forensics-challenge-output.webp" width="549" height="509" alt="Command line output showing some fake flags and the real flag KCTF{W3_AR3_tH3_Kn1GHt}">

The flag is <code>KCTF{W3_AR3_tH3_Kn1GHt}</code>